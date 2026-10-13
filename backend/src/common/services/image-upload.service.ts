import { Injectable, BadRequestException } from '@nestjs/common';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { randomBytes } from 'crypto';

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class ImageUploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxImages = 10;

  private readonly uploadDir = join(process.cwd(), 'uploads', 'images');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  validateFile(file: { originalname?: string; mimetype?: string; size?: number; buffer?: Buffer }): void {
    // Check if file exists
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype || '')) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // Validate extension
    const ext = extname(file.originalname || '').toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size && file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check for executable content (basic check)
    if (file.buffer && this.containsExecutableContent(file.buffer)) {
      throw new BadRequestException('File contains potentially executable content');
    }
  }

  private containsExecutableContent(buffer: Buffer): boolean {
    // Check for common executable signatures
    const signatures = [
      [0x4d, 0x5a], // EXE/DLL (MZ header)
      [0x7f, 0x45, 0x4c, 0x46], // ELF (Linux executable)
      [0x50, 0x4b, 0x03, 0x04], // ZIP (could contain executables)
      [0xca, 0xfe, 0xba, 0xbe], // Java class
    ];

    for (const sig of signatures) {
      if (this.bufferStartsWith(buffer, sig)) {
        return true;
      }
    }

    return false;
  }

  private bufferStartsWith(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    return true;
  }

  async saveFile(file: { originalname?: string; mimetype?: string; size?: number; buffer?: Buffer }): Promise<UploadedFile> {
    this.validateFile(file);

    // Generate unique filename
    const ext = extname(file.originalname || '').toLowerCase();
    const filename = `${randomBytes(16).toString('hex')}${ext}`;

    return {
      url: `/uploads/images/${filename}`,
      filename,
      originalName: file.originalname || '',
      size: file.size || 0,
      mimeType: file.mimetype || '',
    };
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = join(this.uploadDir, filename);
    
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  getMaxImages(): number {
    return this.maxImages;
  }

  getAllowedExtensions(): string[] {
    return this.allowedExtensions;
  }
}
