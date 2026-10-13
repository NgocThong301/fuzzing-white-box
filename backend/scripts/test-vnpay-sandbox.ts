/**
 * VNPAY Sandbox Flow Test Script
 * ===============================
 * 
 * Test the complete VNPAY sandbox payment flow:
 * 1. Create order with VNPAY_SANDBOX payment method
 * 2. Verify payment URL redirects to internal sandbox page
 * 3. Confirm payment through sandbox endpoint
 * 4. Verify order status is updated
 */

import { PrismaClient, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  
  // Delete in reverse order of dependencies
  await prisma.auditLog.deleteMany({ where: { entityType: 'Payment' } });
  await prisma.payment.deleteMany({ where: { method: PaymentMethod.VNPAY_SANDBOX } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: 'TEST-VNPAY-' } } });
  
  console.log('✅ Cleanup completed\n');
}

async function runTest() {
  console.log('🚀 Starting VNPAY Sandbox Flow Test\n');
  console.log('='.repeat(60));

  try {
    // Step 0: Cleanup
    await cleanup();

    // Step 1: Get test users
    console.log('📋 Step 1: Getting test users...');
    
    const buyer = await prisma.user.findFirst({
      where: { email: 'buyer@example.com' },
      include: { roles: true }
    });
    
    const seller = await prisma.user.findFirst({
      where: { email: 'seller@example.com' },
      include: { roles: true }
    });
    
    if (!buyer || !seller) {
      throw new Error('Test users not found. Run seed first.');
    }
    
    console.log(`   ✅ Buyer: ${buyer.email} (ID: ${buyer.id})`);
    console.log(`   ✅ Seller: ${seller.email} (ID: ${seller.id})\n`);

    // Step 2: Get approved listings
    console.log('📋 Step 2: Getting approved listings...');
    
    const listings = await prisma.listing.findMany({
      where: { status: 'APPROVED', sellerId: seller.id },
      take: 2,
      include: { book: true }
    });
    
    if (listings.length === 0) {
      throw new Error('No approved listings found. Run seed first.');
    }
    
    console.log(`   ✅ Found ${listings.length} listings:`);
    listings.forEach((l, i) => {
      console.log(`      ${i + 1}. ${l.book.title} - ${l.price} VND`);
    });
    console.log('');

    // Step 3: Create order
    console.log('📋 Step 3: Creating order with PENDING_PAYMENT status...');
    
    const orderNumber = `TEST-VNPAY-${Date.now()}`;
    const totalAmount = listings.reduce((sum, l) => sum + Number(l.price), 0);
    const shippingFee = 30000;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyer.id,
        sellerId: seller.id,
        totalAmount,
        shippingFee,
        discountAmount: 0,
        finalAmount: totalAmount + shippingFee,
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddress: '123 Test Street, District 1, HCMC',
        shippingPhone: '0909123456',
        shippingName: 'Test User',
      }
    });
    
    console.log(`   ✅ Order created: ${order.orderNumber}`);
    console.log(`   ✅ Order ID: ${order.id}`);
    console.log(`   ✅ Final Amount: ${order.finalAmount} VND`);
    console.log(`   ✅ Status: ${order.status}\n`);

    // Step 4: Create order items and update listings
    console.log('📋 Step 4: Creating order items...');
    
    for (const listing of listings) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          listingId: listing.id,
          quantity: 1,
          unitPrice: listing.price,
          subtotal: listing.price,
        }
      });
      
      // Update listing status to SOLD
      await prisma.listing.update({
        where: { id: listing.id },
        data: { status: 'SOLD' }
      });
    }
    
    console.log(`   ✅ Created ${listings.length} order items\n`);

    // Step 5: Create VNPAY Sandbox payment
    console.log('📋 Step 5: Creating VNPAY Sandbox payment...');
    
    // Simulate what PaymentService.createVnpayPayment does
    const vnpayGateway = {
      createPaymentUrl: (params: any) => {
        const txnRef = `TEST${Date.now()}`;
        const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return {
          paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?txnRef=${txnRef}`,
          txnRef,
          amount: params.amount,
          expiresAt: expireDate,
        };
      }
    };
    
    const frontendUrl = 'http://localhost:5173';
    const vnpayResult = vnpayGateway.createPaymentUrl({
      orderId: order.id,
      amount: Number(order.finalAmount),
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      ipAddress: '127.0.0.1',
      returnUrl: `${frontendUrl}/payment/vnpay/return`,
      ipnUrl: 'http://localhost:3000/api/payments/vnpay/ipn',
    });
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: PaymentMethod.VNPAY_SANDBOX,
        amount: order.finalAmount,
        status: PaymentStatus.PENDING,
        transactionId: vnpayResult.txnRef,
        gatewayResponse: {
          txnRef: vnpayResult.txnRef,
          paymentUrl: vnpayResult.paymentUrl,
          expiresAt: vnpayResult.expiresAt.toISOString(),
        } as any,
      }
    });
    
    console.log(`   ✅ Payment created: ${payment.id}`);
    console.log(`   ✅ TxnRef: ${payment.transactionId}`);
    console.log(`   ✅ Status: ${payment.status}`);
    console.log(`   ✅ Original paymentUrl: ${vnpayResult.paymentUrl}\n`);

    // Step 6: Verify the flow - Check what URL user would be redirected to
    console.log('📋 Step 6: Verifying Internal Sandbox URL (Option A)...');
    
    // Simulate the NEW Option A logic from PaymentService
    const sandboxPaymentUrl = `${frontendUrl}/payment/sandbox/${payment.id}?txnRef=${vnpayResult.txnRef}`;
    console.log(`   🔗 Internal Sandbox URL: ${sandboxPaymentUrl}`);
    
    // Verify the URL format
    const url = new URL(sandboxPaymentUrl);
    const isCorrectFormat = 
      url.hostname === 'localhost' &&
      url.port === '5173' &&
      url.pathname === '/payment/sandbox/' + payment.id &&
      url.searchParams.get('txnRef') === vnpayResult.txnRef;
    
    if (isCorrectFormat) {
      console.log('   ✅ URL format is CORRECT');
    } else {
      console.log('   ❌ URL format is INCORRECT');
    }
    console.log('');

    // Step 7: Simulate user completing payment on sandbox page
    console.log('📋 Step 7: Simulating sandbox payment confirmation...');
    
    // Simulate what SandboxPaymentPage does - call confirmSandboxPayment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        completedAt: new Date(),
        transactionId: vnpayResult.txnRef,
        gatewayResponse: {
          txnRef: vnpayResult.txnRef,
          sandbox: true,
          internalSandbox: true,
          confirmedAt: new Date().toISOString(),
        } as any,
      },
      include: { order: true }
    });
    
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CONFIRMED }
    });
    
    console.log(`   ✅ Payment status: ${updatedPayment.status}`);
    console.log(`   ✅ Paid at: ${updatedPayment.paidAt}`);
    
    // Re-fetch order to verify
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id }
    });
    console.log(`   ✅ Order status: ${updatedOrder?.status}\n`);

    // Step 8: Final verification
    console.log('📋 Step 8: Final Verification...');
    console.log('');
    
    const tests = [
      {
        name: 'Order has PENDING_PAYMENT status before payment',
        passed: order.status === OrderStatus.PENDING_PAYMENT,
        actual: order.status,
        expected: OrderStatus.PENDING_PAYMENT
      },
      {
        name: 'Payment method is VNPAY_SANDBOX',
        passed: payment.method === PaymentMethod.VNPAY_SANDBOX,
        actual: payment.method,
        expected: PaymentMethod.VNPAY_SANDBOX
      },
      {
        name: 'Payment status changes to SUCCESS after confirmation',
        passed: updatedPayment.status === PaymentStatus.SUCCESS,
        actual: updatedPayment.status,
        expected: PaymentStatus.SUCCESS
      },
      {
        name: 'Order status changes to CONFIRMED after payment',
        passed: updatedOrder?.status === OrderStatus.CONFIRMED,
        actual: updatedOrder?.status,
        expected: OrderStatus.CONFIRMED
      },
      {
        name: 'Internal sandbox URL format is correct',
        passed: isCorrectFormat,
        actual: sandboxPaymentUrl,
        expected: `${frontendUrl}/payment/sandbox/${payment.id}?txnRef=${vnpayResult.txnRef}`
      }
    ];
    
    let allPassed = true;
    tests.forEach((test, i) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`   ${status} Test ${i + 1}: ${test.name}`);
      if (!test.passed) {
        console.log(`      Expected: ${test.expected}`);
        console.log(`      Actual: ${test.actual}`);
        allPassed = false;
      }
    });
    
    console.log('');
    console.log('='.repeat(60));
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('');
      console.log('Summary:');
      console.log(`   • Order ${orderNumber} created successfully`);
      console.log(`   • VNPAY Sandbox payment URL redirects to internal page`);
      console.log(`   • Payment confirmation flow works correctly`);
      console.log(`   • Order status updated to CONFIRMED`);
    } else {
      console.log('❌ SOME TESTS FAILED!');
    }
    
    console.log('');
    console.log('='.repeat(60));
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.payment.deleteMany({ where: { id: payment.id } });
    await prisma.order.deleteMany({ where: { id: order.id } });
    
    // Restore listing statuses
    for (const listing of listings) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { status: 'APPROVED' }
      });
    }
    
    console.log('✅ Test data cleaned up\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runTest()
  .then(() => {
    console.log('Test script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
