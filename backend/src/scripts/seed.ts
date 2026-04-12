// @ts-nocheck
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, EventCategory } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Event, EventStatus, EventDateType, LocationType } from '../entities/event.entity';
import { TicketType } from '../entities/ticket-type.entity';
import { Order } from '../entities/order.entity';
import { Ticket } from '../entities/ticket.entity';
import { Review } from '../entities/review.entity';
import { Attendance } from '../entities/attendance.entity';
import { Venue } from '../entities/venue.entity';

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mac@localhost:5432/event_organization_db',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: false,
});

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepo = AppDataSource.getRepository(User);
    const orgRepo = AppDataSource.getRepository(Organization);
    const eventRepo = AppDataSource.getRepository(Event);
    const ticketTypeRepo = AppDataSource.getRepository(TicketType);
    const orderRepo = AppDataSource.getRepository(Order);
    const ticketRepo = AppDataSource.getRepository(Ticket);
    const reviewRepo = AppDataSource.getRepository(Review);
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const venueRepo = AppDataSource.getRepository(Venue);

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // ========== Create Owner Users First ==========
    console.log('� Creating organization owner users...');

    const ownerUsers = await userRepo.save([
      {
        name: 'Sarah Smith',
        email: 'sarah@techconglobal.com',
        passwordHash: hashedPassword,
        phone: '+1-555-1001',
        roles: [UserRole.ORGANIZER],
        emailVerified: true,
        hostingEventTypes: [EventCategory.CONFERENCE, EventCategory.WORKSHOP],
        bio: 'Tech conference organizer with 10+ years of experience',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      {
        name: 'John Doe',
        email: 'john@musicfestpro.com',
        passwordHash: hashedPassword,
        phone: '+1-555-1002',
        roles: [UserRole.ORGANIZER],
        emailVerified: true,
        hostingEventTypes: [EventCategory.CONCERT, EventCategory.FESTIVAL],
        bio: 'Music festival producer and event coordinator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa@sportsevents.com',
        passwordHash: hashedPassword,
        phone: '+1-555-1003',
        roles: [UserRole.ORGANIZER],
        emailVerified: true,
        hostingEventTypes: [EventCategory.SPORTS],
        bio: 'Professional sports event manager',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      },
      {
        name: 'David Wilson',
        email: 'david@workshophub.com',
        passwordHash: hashedPassword,
        phone: '+1-555-1004',
        roles: [UserRole.ORGANIZER],
        emailVerified: true,
        hostingEventTypes: [EventCategory.WORKSHOP, EventCategory.SEMINAR],
        bio: 'Educational workshop facilitator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      },
    ]);

    console.log(`✅ Created ${ownerUsers.length} owner users`);

    // ========== Create Organizations ==========
    console.log('📦 Creating organizations...');
    
    const organizations = await orgRepo.save([
      {
        name: 'TechCon Global',
        description: 'Leading technology conference organizer',
        website: 'https://techconglobal.com',
        contactEmail: 'info@techconglobal.com',
        contactPhone: '+1-555-0101',
        ownerId: ownerUsers[0].id,
      },
      {
        name: 'Music Festival Productions',
        description: 'Premier music festival and concert organizer',
        website: 'https://musicfestpro.com',
        contactEmail: 'contact@musicfestpro.com',
        contactPhone: '+1-555-0102',
        ownerId: ownerUsers[1].id,
      },
      {
        name: 'Sports Events Inc',
        description: 'Professional sports event management',
        website: 'https://sportsevents.com',
        contactEmail: 'hello@sportsevents.com',
        contactPhone: '+1-555-0103',
        ownerId: ownerUsers[2].id,
      },
      {
        name: 'Workshop Hub',
        description: 'Educational workshops and training sessions',
        website: 'https://workshophub.com',
        contactEmail: 'info@workshophub.com',
        contactPhone: '+1-555-0104',
        ownerId: ownerUsers[3].id,
      },
    ]);

    console.log(`✅ Created ${organizations.length} organizations`);

    // ========== Update Owner Users with Organization IDs ==========
    console.log('� Updating owner users with organization IDs...');
    
    ownerUsers[0].organizationId = organizations[0].id;
    ownerUsers[1].organizationId = organizations[1].id;
    ownerUsers[2].organizationId = organizations[2].id;
    ownerUsers[3].organizationId = organizations[3].id;
    
    await userRepo.save(ownerUsers);

    // ========== Create Attendee Users ==========
    console.log('👥 Creating attendee users...');

    const attendeeUsers = await userRepo.save([
      {
        name: 'Jessica Brown',
        email: 'jessica.brown@email.com',
        passwordHash: hashedPassword,
        phone: '+1-555-2001',
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        interestedEventCategories: [EventCategory.CONFERENCE, EventCategory.NETWORKING],
        bio: 'Tech enthusiast and networking professional',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
      },
      {
        name: 'Michael Johnson',
        email: 'michael.j@email.com',
        passwordHash: hashedPassword,
        phone: '+1-555-2002',
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        interestedEventCategories: [EventCategory.CONCERT, EventCategory.FESTIVAL],
        bio: 'Music lover and festival goer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        passwordHash: hashedPassword,
        phone: '+1-555-2003',
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        interestedEventCategories: [EventCategory.WORKSHOP, EventCategory.SEMINAR],
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
      {
        name: 'Robert Martinez',
        email: 'robert.m@email.com',
        passwordHash: hashedPassword,
        phone: '+1-555-2004',
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        interestedEventCategories: [EventCategory.SPORTS],
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      },
      {
        name: 'Amanda Taylor',
        email: 'amanda.t@email.com',
        passwordHash: hashedPassword,
        phone: '+1-555-2005',
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        interestedEventCategories: [EventCategory.CONFERENCE, EventCategory.WORKSHOP],
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
      },
    ]);

    console.log(`✅ Created ${attendeeUsers.length} attendee users`);
    
    const allUsers = [...ownerUsers, ...attendeeUsers];

    // ========== Create Venues ==========
    console.log('🏢 Creating venues...');

    const venues = await venueRepo.save([
      {
        name: 'San Francisco Convention Center',
        addressLine1: '747 Howard St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
        country: 'USA',
        capacity: 5000,
      },
      {
        name: 'Madison Square Garden',
        addressLine1: '4 Pennsylvania Plaza',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        capacity: 20000,
      },
      {
        name: 'Austin Convention Center',
        addressLine1: '500 E Cesar Chavez St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
        capacity: 3000,
      },
    ]);

    console.log(`✅ Created ${venues.length} venues`);

    // ========== Create Events ==========
    console.log('🎉 Creating events...');

    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const futureDate2 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    const futureDate3 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const events = await eventRepo.save([
      {
        title: 'Tech Innovation Summit 2026',
        shortDescription: 'Join industry leaders for the biggest tech conference of the year',
        longDescription: 'A comprehensive 3-day conference featuring keynotes, workshops, and networking opportunities with tech innovators from around the world.',
        organizerId: organizations[0].id,
        status: EventStatus.PUBLISHED,
        category: 'conference',
        tags: ['technology', 'innovation', 'networking', 'AI', 'blockchain'],
        dateType: EventDateType.ONE_TIME,
        startAt: futureDate1,
        endAt: new Date(futureDate1.getTime() + 3 * 24 * 60 * 60 * 1000),
        locationType: LocationType.PHYSICAL,
        venueId: venues[0].id,
        customLocation: {
          address: '747 Howard St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA',
        },
        images: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        ],
        viewCount: 1250,
        favoriteCount: 89,
      },
      {
        title: 'Summer Music Festival LA',
        shortDescription: 'Three days of amazing music under the California sun',
        longDescription: 'Experience the best music festival of the summer with top artists, food trucks, and unforgettable vibes.',
        organizerId: organizations[1].id,
        status: EventStatus.PUBLISHED,
        category: 'concert',
        tags: ['music', 'festival', 'outdoor', 'summer'],
        dateType: EventDateType.ONE_TIME,
        startAt: futureDate2,
        endAt: new Date(futureDate2.getTime() + 3 * 24 * 60 * 60 * 1000),
        locationType: LocationType.PHYSICAL,
        venueId: venues[1].id,
        customLocation: {
          address: '4 Pennsylvania Plaza',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        ],
        viewCount: 3420,
        favoriteCount: 256,
      },
      {
        title: 'Marathon Championship 2026',
        shortDescription: 'Annual city marathon with prizes and charity fundraising',
        longDescription: 'Join thousands of runners in this prestigious marathon event. All proceeds go to local charities.',
        organizerId: organizations[2].id,
        status: EventStatus.PUBLISHED,
        category: 'sports',
        tags: ['marathon', 'running', 'charity', 'fitness'],
        dateType: EventDateType.ONE_TIME,
        startAt: futureDate3,
        endAt: new Date(futureDate3.getTime() + 6 * 60 * 60 * 1000),
        locationType: LocationType.PHYSICAL,
        customLocation: {
          address: 'City Center',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          country: 'USA',
        },
        images: [
          'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
        ],
        viewCount: 890,
        favoriteCount: 45,
      },
      {
        title: 'Web Development Bootcamp',
        shortDescription: 'Intensive 2-week coding bootcamp for aspiring developers',
        longDescription: 'Learn modern web development from scratch with hands-on projects and expert instructors.',
        organizerId: organizations[3].id,
        status: EventStatus.PUBLISHED,
        category: 'workshop',
        tags: ['coding', 'web development', 'bootcamp', 'education'],
        dateType: EventDateType.ONE_TIME,
        startAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 59 * 24 * 60 * 60 * 1000),
        locationType: LocationType.ONLINE,
        onlineLink: 'https://zoom.us/j/workshop123',
        onlineInstructions: 'Link will be sent 24 hours before the event',
        images: [
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        ],
        viewCount: 567,
        favoriteCount: 78,
      },
      {
        title: 'Rooftop Rhythms',
        shortDescription: 'Intimate acoustic sessions on a downtown rooftop',
        longDescription: 'Enjoy live acoustic performances in an intimate rooftop setting with stunning city views.',
        organizerId: organizations[1].id,
        status: EventStatus.PUBLISHED,
        category: 'concert',
        tags: ['music', 'acoustic', 'rooftop', 'intimate'],
        dateType: EventDateType.ONE_TIME,
        startAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        locationType: LocationType.PHYSICAL,
        customLocation: {
          address: '123 Rooftop Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        images: [
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        ],
        viewCount: 234,
        favoriteCount: 34,
      },
    ]);

    console.log(`✅ Created ${events.length} events`);

    // ========== Create Ticket Types ==========
    console.log('🎫 Creating ticket types...');

    const ticketTypes = [];

    // Tech Innovation Summit tickets
    ticketTypes.push(
      await ticketTypeRepo.save({
        eventId: events[0].id,
        title: 'General Admission',
        description: 'Access to all conference sessions',
        type: 'General Admission',
        price: 299.00,
        currency: 'USD',
        quantityTotal: 500,
        quantitySold: 234,
        isFree: false,
        salesStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        salesEnd: futureDate1,
      }),
      await ticketTypeRepo.save({
        eventId: events[0].id,
        title: 'VIP Pass',
        description: 'VIP access with exclusive networking events',
        type: 'VIP',
        price: 599.00,
        currency: 'USD',
        quantityTotal: 100,
        quantitySold: 67,
        isFree: false,
        salesStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        salesEnd: futureDate1,
      }),
      await ticketTypeRepo.save({
        eventId: events[0].id,
        title: 'Early Bird',
        description: 'Early bird special pricing',
        type: 'Early Bird',
        price: 199.00,
        currency: 'USD',
        quantityTotal: 200,
        quantitySold: 200,
        isFree: false,
        salesStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        salesEnd: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      })
    );

    // Music Festival tickets
    ticketTypes.push(
      await ticketTypeRepo.save({
        eventId: events[1].id,
        title: 'General Admission',
        description: '3-day festival pass',
        type: 'General Admission',
        price: 350.00,
        currency: 'USD',
        quantityTotal: 1000,
        quantitySold: 456,
        isFree: false,
      }),
      await ticketTypeRepo.save({
        eventId: events[1].id,
        title: 'VIP Experience',
        description: 'VIP area access with premium amenities',
        type: 'VIP',
        price: 750.00,
        currency: 'USD',
        quantityTotal: 200,
        quantitySold: 123,
        isFree: false,
      })
    );

    // Marathon tickets
    ticketTypes.push(
      await ticketTypeRepo.save({
        eventId: events[2].id,
        title: 'Runner Registration',
        description: 'Marathon participant registration',
        type: 'General Admission',
        price: 75.00,
        currency: 'USD',
        quantityTotal: 2000,
        quantitySold: 892,
        isFree: false,
      })
    );

    // Workshop tickets
    ticketTypes.push(
      await ticketTypeRepo.save({
        eventId: events[3].id,
        title: 'Bootcamp Enrollment',
        description: 'Full bootcamp access',
        type: 'General Admission',
        price: 1200.00,
        currency: 'USD',
        quantityTotal: 50,
        quantitySold: 38,
        isFree: false,
      })
    );

    // Rooftop Rhythms tickets
    ticketTypes.push(
      await ticketTypeRepo.save({
        eventId: events[4].id,
        title: 'General Admission',
        description: 'Standing room access',
        type: 'General Admission',
        price: 45.00,
        currency: 'USD',
        quantityTotal: 150,
        quantitySold: 89,
        isFree: false,
      })
    );

    console.log(`✅ Created ${ticketTypes.length} ticket types`);

    // ========== Create Orders ==========
    console.log('💳 Creating orders...');

    const orders: Order[] = [];
    const tickets: Ticket[] = [];

    // Create orders for attendees
    const attendees = attendeeUsers;

    // Order 1: Jessica buys Tech Summit tickets
    const order1 = await orderRepo.save({
      userId: attendees[0].id,
      eventId: events[0].id,
      amountSubtotal: 897.00,
      serviceFee: 44.85,
      processingFee: 26.91,
      amountTotal: 968.76,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'card',
      billingName: attendees[0].name,
      billingEmail: attendees[0].email,
      paidAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    });
    orders.push(order1);

    // Create tickets for order 1
    for (let i = 0; i < 3; i++) {
      tickets.push(
        await ticketRepo.save({
          orderId: order1.id,
          ticketTypeId: ticketTypes[0].id,
          ownerId: attendees[0].id,
          eventId: events[0].id,
          price: 299.00,
          currency: 'USD',
          status: 'valid',
          qrCode: `QR-${order1.id}-${i}`,
        })
      );
    }

    // Order 2: Michael buys Music Festival VIP
    const order2 = await orderRepo.save({
      userId: attendees[1].id,
      eventId: events[1].id,
      amountSubtotal: 1500.00,
      serviceFee: 75.00,
      processingFee: 45.00,
      amountTotal: 1620.00,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'card',
      billingName: attendees[1].name,
      billingEmail: attendees[1].email,
      paidAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });
    orders.push(order2);

    tickets.push(
      await ticketRepo.save({
        orderId: order2.id,
        ticketTypeId: ticketTypes[4].id,
        ownerId: attendees[1].id,
        eventId: events[1].id,
        price: 750.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order2.id}-0`,
      }),
      await ticketRepo.save({
        orderId: order2.id,
        ticketTypeId: ticketTypes[4].id,
        ownerId: attendees[1].id,
        eventId: events[1].id,
        price: 750.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order2.id}-1`,
      })
    );

    // Order 3: Emily buys Workshop
    const order3 = await orderRepo.save({
      userId: attendees[2].id,
      eventId: events[3].id,
      amountSubtotal: 1200.00,
      serviceFee: 60.00,
      processingFee: 36.00,
      amountTotal: 1296.00,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'card',
      billingName: attendees[2].name,
      billingEmail: attendees[2].email,
      paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });
    orders.push(order3);

    tickets.push(
      await ticketRepo.save({
        orderId: order3.id,
        ticketTypeId: ticketTypes[6].id,
        ownerId: attendees[2].id,
        eventId: events[3].id,
        price: 1200.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order3.id}-0`,
      })
    );

    // Order 4: Robert buys Marathon
    const order4 = await orderRepo.save({
      userId: attendees[3].id,
      eventId: events[2].id,
      amountSubtotal: 75.00,
      serviceFee: 3.75,
      processingFee: 2.25,
      amountTotal: 81.00,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'card',
      billingName: attendees[3].name,
      billingEmail: attendees[3].email,
      paidAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    });
    orders.push(order4);

    tickets.push(
      await ticketRepo.save({
        orderId: order4.id,
        ticketTypeId: ticketTypes[5].id,
        ownerId: attendees[3].id,
        eventId: events[2].id,
        price: 75.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order4.id}-0`,
      })
    );

    // Order 5: Amanda buys Rooftop concert
    const order5 = await orderRepo.save({
      userId: attendees[4].id,
      eventId: events[4].id,
      amountSubtotal: 90.00,
      serviceFee: 4.50,
      processingFee: 2.70,
      amountTotal: 97.20,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'card',
      billingName: attendees[4].name,
      billingEmail: attendees[4].email,
      paidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });
    orders.push(order5);

    tickets.push(
      await ticketRepo.save({
        orderId: order5.id,
        ticketTypeId: ticketTypes[7].id,
        ownerId: attendees[4].id,
        eventId: events[4].id,
        price: 45.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order5.id}-0`,
      }),
      await ticketRepo.save({
        orderId: order5.id,
        ticketTypeId: ticketTypes[7].id,
        ownerId: attendees[4].id,
        eventId: events[4].id,
        price: 45.00,
        currency: 'USD',
        status: 'valid',
        qrCode: `QR-${order5.id}-1`,
      })
    );

    // Pending order
    const order6 = await orderRepo.save({
      userId: attendees[0].id,
      eventId: events[1].id,
      amountSubtotal: 350.00,
      serviceFee: 17.50,
      processingFee: 10.50,
      amountTotal: 378.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'card',
      billingName: attendees[0].name,
      billingEmail: attendees[0].email,
    });
    orders.push(order6);

    console.log(`✅ Created ${orders.length} orders`);
    console.log(`✅ Created ${tickets.length} tickets`);

    // ========== Create Reviews ==========
    console.log('⭐ Creating reviews...');

    const reviews = await reviewRepo.save([
      {
        userId: attendees[0].id,
        eventId: events[0].id,
        rating: 5,
        comment: 'Amazing conference! Learned so much and made great connections.',
      },
      {
        userId: attendees[1].id,
        eventId: events[1].id,
        rating: 4,
        comment: 'Great lineup and atmosphere. Could use better food options.',
      },
      {
        userId: attendees[3].id,
        eventId: events[2].id,
        rating: 5,
        comment: 'Well organized marathon. Great cause!',
      },
    ]);

    console.log(`✅ Created ${reviews.length} reviews`);

    // ========== Create Attendance Records ==========
    console.log('✅ Creating attendance records...');

    const attendanceRecords = [];
    for (const ticket of tickets.slice(0, 5)) {
      attendanceRecords.push(
        await attendanceRepo.save({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          checkedInAt: new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        })
      );
    }

    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${organizations.length} Organizations`);
    console.log(`   - ${allUsers.length} Users (${ownerUsers.length} Organizers, ${attendeeUsers.length} Attendees)`);
    console.log(`   - ${venues.length} Venues`);
    console.log(`   - ${events.length} Events`);
    console.log(`   - ${ticketTypes.length} Ticket Types`);
    console.log(`   - ${orders.length} Orders`);
    console.log(`   - ${tickets.length} Tickets`);
    console.log(`   - ${reviews.length} Reviews`);
    console.log(`   - ${attendanceRecords.length} Attendance Records`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('✅ Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
