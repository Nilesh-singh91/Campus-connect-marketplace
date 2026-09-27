import { PrismaClient } from "@prisma/client";
import { Role, UserStatus, ItemCondition, TransactionType, ListingStatus } from "../src/types/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusConnect Marketplace database with multi-college campuses and rich products...");

  // 1. Seed College Domains
  const domains = [
    { domain: "liet.in", collegeName: "Lloyd Institute of Engineering & Technology (LIET)" },
    { domain: "aktu.in", collegeName: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)" },
    { domain: "college.edu", collegeName: "National Institute of Technology" },
    { domain: "lit.ac.in", collegeName: "Laxminarayan Innovation & Tech Campus" },
    { domain: "iitb.ac.in", collegeName: "Indian Institute of Technology Bombay" },
    { domain: "nith.ac.in", collegeName: "National Institute of Technology Hamirpur" },
    { domain: "campus.edu", collegeName: "Metropolitan Engineering College" },
  ];

  const domainMap = new Map<string, string>();
  for (const d of domains) {
    const existing = await prisma.collegeDomain.upsert({
      where: { domain: d.domain },
      update: { collegeName: d.collegeName },
      create: { domain: d.domain, collegeName: d.collegeName, isActive: true },
    });
    domainMap.set(d.domain, existing.id);
  }
  console.log(`✓ Seeded ${domains.length} college domains`);

  // 2. Seed Categories
  const categories = [
    {
      name: "Textbooks & Reference Books",
      slug: "textbooks",
      icon: "BookOpen",
      description: "Engineering, Mathematics, CS algorithms, and semester books",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: "Laptop",
      description: "Laptops, monitors, scientific calculators, Arduino kits, keyboards, and headphones",
    },
    {
      name: "Engineering Equipment & Tools",
      slug: "engineering-tools",
      icon: "Wrench",
      description: "Mini drafters, engineering drawing sets, lab coats, and breadboards",
    },
    {
      name: "Handwritten Notes & Materials",
      slug: "notes-materials",
      icon: "FileText",
      description: "Topper notes, gate preparation guides, and practical lab manuals",
    },
    {
      name: "Hostel & Room Essentials",
      slug: "hostel-essentials",
      icon: "Home",
      description: "Study lamps, kettles, extension cords, mattresses, and organizers",
    },
    {
      name: "Bicycles & Campus Mobility",
      slug: "cycles-mobility",
      icon: "Bike",
      description: "Geared & non-geared cycles, locks, and accessories for campus commutes",
    },
    {
      name: "Sports & Fitness Gear",
      slug: "sports-fitness",
      icon: "Trophy",
      description: "Badminton racquets, cricket gear, dumbbells, and footballs",
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, existing.id);
  }
  console.log(`✓ Seeded ${categories.length} categories`);

  // 3. Seed Verified Student Accounts for every college campus
  const defaultPasswordHash = await bcrypt.hash("Campus@1234", 10);

  const lietDomainId = domainMap.get("liet.in")!;
  const aktuDomainId = domainMap.get("aktu.in")!;
  const collegeDomainId = domainMap.get("college.edu")!;
  const litDomainId = domainMap.get("lit.ac.in")!;
  const iitbDomainId = domainMap.get("iitb.ac.in")!;
  const nithDomainId = domainMap.get("nith.ac.in")!;
  const campusDomainId = domainMap.get("campus.edu")!;

  // Admin User
  await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "admin@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "System Administrator",
          enrollmentNumber: "ADMIN-001",
          branch: "Dean Student Affairs",
          yearOfStudy: 4,
          bio: "Platform Administrator for CampusConnect",
        },
      },
    },
  });

  // Moderator User
  await prisma.user.upsert({
    where: { email: "moderator@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "moderator@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.MODERATOR,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Prof. Rajesh Kumar",
          enrollmentNumber: "FACULTY-402",
          branch: "Computer Science",
          yearOfStudy: 4,
          bio: "Student Council Moderator & Verification Officer",
        },
      },
    },
  });

  // Lloyd Student: Aman Verma
  const amanLiet = await prisma.user.upsert({
    where: { email: "aman@liet.in" },
    update: { collegeDomainId: lietDomainId },
    create: {
      email: "aman@liet.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: lietDomainId,
      profile: {
        create: {
          fullName: "Aman Verma",
          enrollmentNumber: "LIET23CSE015",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98765 11223",
          bio: "3rd year CSE student at Lloyd Institute. Selling semester textbooks, laptop & mini drafter.",
        },
      },
    },
  });

  // AKTU Student: Sneha Singh
  const snehaAktu = await prisma.user.upsert({
    where: { email: "sneha@aktu.in" },
    update: { collegeDomainId: aktuDomainId },
    create: {
      email: "sneha@aktu.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: aktuDomainId,
      profile: {
        create: {
          fullName: "Sneha Singh",
          enrollmentNumber: "AKTU24IT089",
          branch: "Information Technology",
          yearOfStudy: 2,
          phone: "+91 98111 22334",
          bio: "2nd year IT student under AKTU curriculum. Trading AKTU Quantum series and notes.",
        },
      },
    },
  });

  // NIT Student: Aarav Sharma
  const aaravNit = await prisma.user.upsert({
    where: { email: "aarav@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "aarav@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Aarav Sharma",
          enrollmentNumber: "2023CSE042",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98765 43210",
          bio: "3rd year CSE student. Selling coding gear, engineering books, and cycle.",
        },
      },
    },
  });

  // LIT Student: Rohit Deshmukh
  const rohitLit = await prisma.user.upsert({
    where: { email: "rohit@lit.ac.in" },
    update: { collegeDomainId: litDomainId },
    create: {
      email: "rohit@lit.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: litDomainId,
      profile: {
        create: {
          fullName: "Rohit Deshmukh",
          enrollmentNumber: "LIT22MECH054",
          branch: "Mechanical Engineering",
          yearOfStudy: 4,
          phone: "+91 98222 33445",
          bio: "Final year Mechanical student at Laxminarayan Institute. Selling drafters, monitors, and laptops.",
        },
      },
    },
  });

  // IIT Bombay Student: Priya Iyer
  const priyaIitb = await prisma.user.upsert({
    where: { email: "priya@iitb.ac.in" },
    update: { collegeDomainId: iitbDomainId },
    create: {
      email: "priya@iitb.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: iitbDomainId,
      profile: {
        create: {
          fullName: "Priya Iyer",
          enrollmentNumber: "220050089",
          branch: "Electrical Engineering",
          yearOfStudy: 3,
          phone: "+91 97654 32100",
          bio: "3rd year EE student at IIT Bombay. Selling electronics kits, books, and sports equipment.",
        },
      },
    },
  });

  // NIT Hamirpur Student: Vikram Chauhan
  const vikramNith = await prisma.user.upsert({
    where: { email: "vikram@nith.ac.in" },
    update: { collegeDomainId: nithDomainId },
    create: {
      email: "vikram@nith.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: nithDomainId,
      profile: {
        create: {
          fullName: "Vikram Chauhan",
          enrollmentNumber: "21ECE034",
          branch: "Electronics & Communication",
          yearOfStudy: 4,
          phone: "+91 98160 55667",
          bio: "Final year ECE student at NITH. Moving out after campus placement, clearing gaming laptop, cycle & lab kits.",
        },
      },
    },
  });

  // Metropolitan Student: Tanvi Patel
  const tanviCampus = await prisma.user.upsert({
    where: { email: "tanvi@campus.edu" },
    update: { collegeDomainId: campusDomainId },
    create: {
      email: "tanvi@campus.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: campusDomainId,
      profile: {
        create: {
          fullName: "Tanvi Patel",
          enrollmentNumber: "MEC24CS078",
          branch: "Computer Science",
          yearOfStudy: 2,
          phone: "+91 98980 12345",
          bio: "2nd year CS student at Metropolitan College. Selling 1st year books, calculators, and lab coat.",
        },
      },
    },
  });

  console.log("✓ Seeded student accounts for all 7 colleges");

  // 4. Seed Campus Listings across all categories and colleges
  const textbooksCat = categoryMap.get("textbooks")!;
  const electronicsCat = categoryMap.get("electronics")!;
  const engineeringCat = categoryMap.get("engineering-tools")!;
  const notesCat = categoryMap.get("notes-materials")!;
  const hostelCat = categoryMap.get("hostel-essentials")!;
  const cyclesCat = categoryMap.get("cycles-mobility")!;
  const sportsCat = categoryMap.get("sports-fitness")!;

  // Clear previous sample listings
  await prisma.listingImage.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.exchangeRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.listing.deleteMany();

  const allListings = [
    // ==========================================
    // 1. LLOYD INSTITUTE (LIET - liet.in)
    // ==========================================
    {
      title: "Dell Inspiron 15 Core i5 (11th Gen / 16GB RAM / 512GB NVMe SSD)",
      description: "Selling my engineering coding laptop in pristine condition. Intel Core i5-1135G7, 16GB DDR4 RAM, 512GB Fast SSD, Full HD Anti-glare screen. Battery gives 4.5+ hours for lab sessions. Includes original 65W Dell charger and laptop sleeve. Physical testing available at LIET Central Computer Lab or Library foyer.",
      price: 27500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: electronicsCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Operating System Concepts (Galvin & Silberschatz - 10th Edition)",
      description: "Standard OS textbook for Lloyd CSE 4th semester. Clean condition with marked important university exam questions. No torn pages. Available for direct handover at LIET central canteen.",
      price: 550.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: textbooksCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Omega Engineering Mini Drafter with Sheet Tube & Drafting Clips",
      description: "Used for 1st year Engineering Graphics lab at Lloyd. Smooth steel rod, 360-degree protractor head. Includes sturdy waterproof PVC sheet holder tube. Handover at LIET Mechanical Workshop block.",
      price: 350.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: engineeringCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GATE CSE Handwritten Topper Revision Notes (Made Easy Complete 10 Subjects)",
      description: "Complete spiral-bound handwritten notes covering Data Structures, Algorithms, OS, DBMS, Computer Networks, TOC, Compiler, COA, Digital, and Discrete Maths. Clear handwriting with solved previous year questions.",
      price: 650.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: amanLiet.id,
      categoryId: notesCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Pigeon 1.5L Stainless Steel Electric Kettle (Hostel Safe with Auto-Cutoff)",
      description: "Very lightly used during winter semester in Lloyd boys hostel. Perfect for quick noodles, tea, coffee, and hot water. 1500W rapid heating with dry-boil safety protection.",
      price: 450.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: hostelCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hero Sprint 26T Hybrid Bicycle with Combination Cable Lock",
      description: "Sturdy single-speed bicycle with front suspension and dual mudguards. Ideal for commuting between hostel and LIET college gates. Tires and brakes in solid condition.",
      price: 2800.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: cyclesCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 2. AKTU (aktu.in)
    // ==========================================
    {
      title: "HP Pavilion 14 (AMD Ryzen 5 5500U / 8GB RAM / 512GB SSD / FHD IPS)",
      description: "Clean student laptop used for college programming projects and online exams. AMD Ryzen 5 (6 cores, 12 threads), 8GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard and fingerprint scanner. Fast boot time under 8 seconds. Comes with HP original charger. Meeting near AKTU central admin block.",
      price: 24500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: electronicsCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "AKTU Engineering Mathematics-I & II Quantum Series (Latest Edition)",
      description: "Complete set of AKTU Quantum series covering 5 years solved university question papers. Chapter-wise breakdown with high-scoring questions highlighted. Crucial for semester exams.",
      price: 250.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: notesCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Casio fx-991EX ClassWiz Scientific Calculator (AKTU Exam Approved)",
      description: "Official non-programmable scientific calculator permitted inside AKTU B.Tech examination halls. High-resolution Natural Textbook Display with 552 functions including matrix, equation, and vector calculations.",
      price: 750.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: electronicsCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Higher Engineering Mathematics by B.S. Grewal (44th Edition)",
      description: "Comprehensive engineering math standard textbook covering Calculus, Differential Equations, Linear Algebra, and Complex Variables. Book has plastic cover and clean internal pages.",
      price: 480.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: snehaAktu.id,
      categoryId: textbooksCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "2nd Year IT & CSE Handwritten Data Structures & Algorithm Notes",
      description: "Concise handwritten notes with clean C++ and Java code implementations for Stacks, Queues, Linked Lists, Trees, Graphs, Sorting, and Dynamic Programming. Includes viva questions.",
      price: 200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: notesCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Wipro 12W LED Flexible Study Lamp with 3 Dimming Color Modes",
      description: "Eye-care desk study lamp with warm, neutral, and cool white modes. Flexible gooseneck with USB charging port. Great for night hostel study sessions without disturbing roommates.",
      price: 399.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: hostelCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 3. NATIONAL INSTITUTE OF TECHNOLOGY (college.edu)
    // ==========================================
    {
      title: "Lenovo ThinkPad T480 (Core i7 8th Gen / 32GB RAM / 512GB SSD / Linux Ready)",
      description: "Legendary ThinkPad build quality with dual batteries (6+ hours runtime). Intel Core i7, upgraded to 32GB RAM, 512GB Fast SSD, spill-resistant keyboard and dual Thunderbolt ports. Excellent workstation for Docker, Android Studio, and compiler development. Handoff at NIT central library.",
      price: 28500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: electronicsCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "CLRS Introduction to Algorithms (4th Edition - MIT Press)",
      description: "The gold standard algorithms textbook in like-new condition. Essential for CSE 3rd semester and FAANG technical interview preparation. Hardcover, no ink marks or highlights.",
      price: 850.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: aaravNit.id,
      categoryId: textbooksCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Computer Networks by Andrew S. Tanenbaum & David Wetherall (5th Edition)",
      description: "Comprehensive networking reference book covering OSI stack, TCP/IP, routing protocols, socket programming, and wireless networks. Includes end-of-chapter solved problem printouts.",
      price: 590.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: textbooksCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Keychron K2 Wireless Mechanical Keyboard (Gateron Brown Tactile Switches)",
      description: "75% compact wireless/wired mechanical keyboard with Mac & Windows layout support. RGB backlighting, Bluetooth 5.1 connectable with up to 3 devices simultaneously. Includes keycap puller and USB-C braided cable.",
      price: 4200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: aaravNit.id,
      categoryId: electronicsCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hero Sprint Pro 21-Speed Geared Mountain Bicycle with Disk Brakes",
      description: "Alloy frame 27.5T cycle with Shimano 21-speed gears, front suspension fork, and front/rear mechanical disc brakes. Serviced last month with new chain and brake pads. Includes heavy numeric lock.",
      price: 3400.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: cyclesCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GATE & Placement Coding Master Preparation Formula Notes & Cheat Sheets",
      description: "Laminated quick revision cheat sheets for Time Complexity, Dynamic Programming patterns, SQL queries, and Core CS subject formulas. Saved hours during interview season.",
      price: 320.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: notesCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 4. LAXMINARAYAN INNOVATION CAMPUS (lit.ac.in)
    // ==========================================
    {
      title: "Acer Aspire 5 Laptop (Core i5 12th Gen / 16GB RAM / 512GB SSD / NVIDIA MX550)",
      description: "Purchased in 2nd year, used for CAD rendering, MATLAB simulations, and coding. 12th Gen Intel Core i5-1240P, 16GB dual-channel RAM, dedicated NVIDIA GeForce MX550 GPU. Zero dents, pristine keyboard. Handover at LIT Mechanical Dept or Hostel 2.",
      price: 29500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: electronicsCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "LG 24-inch Full HD IPS Borderless Monitor (75Hz / HDMI / AMD FreeSync)",
      description: "24-inch anti-glare desktop monitor with 99% sRGB color accuracy. Perfect secondary screen for split-screen coding and engineering diagrams. Includes HDMI cable and power adapter. Handover at LIT boys hostel.",
      price: 6200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: electronicsCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Database System Concepts by Silberschatz, Korth & Sudarshan (7th Edition)",
      description: "Essential reference book for DBMS course. Covers Relational Model, SQL, Normalization, Transaction Processing, and NoSQL databases. Book is covered with clear plastic wrap.",
      price: 520.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: rohitLit.id,
      categoryId: textbooksCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Engineering Drawing Board (A2 Size) with Mini Drafter & Set Squares",
      description: "High quality pine wood drawing board with metal edges, mini drafter with steel ruler blades, 45 & 60 degree set squares, and drafting tape. Everything required for 1st year Engineering Graphics.",
      price: 550.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: engineeringCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mechanical Engineering Thermodynamics & Fluid Mechanics Solved Lab Manual",
      description: "Handwritten lab observations, circuit/apparatus diagrams, calculation tables, and 100+ viva questions solved for semester university practicals.",
      price: 180.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: notesCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 5. IIT BOMBAY (iitb.ac.in)
    // ==========================================
    {
      title: "Apple MacBook Air M1 (8GB Unified Memory / 256GB SSD / Space Grey)",
      description: "Extremely well-maintained MacBook Air with Apple M1 chip. Battery health at 91% (gives full 12+ hours coding session). Retina display with True Tone. Includes original 30W USB-C brick, MagSafe/USB-C braided cable and box. Available for in-person handoff inside IITB campus (Hostel 12 or SAC).",
      price: 47000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Introduction to the Theory of Computation by Michael Sipser (3rd Edition)",
      description: "International edition textbook for Automata Theory, Formal Languages, Turing Machines, and Computational Complexity (P vs NP). Crisp condition, no highlighting.",
      price: 600.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: priyaIitb.id,
      categoryId: textbooksCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Raspberry Pi 4 Model B (4GB RAM) with Aluminum Passive Cooling Case & 64GB MicroSD",
      description: "Used for IoT robotics term project at IIT Bombay. Quad-core ARM Cortex-A72 CPU, dual micro-HDMI 4K outputs, Gigabit Ethernet, Bluetooth 5.0. Preloaded with Raspberry Pi OS on SanDisk Extreme 64GB card. Handover at EE department.",
      price: 4800.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones (50-hr Battery)",
      description: "Lightweight wireless headphones with DSEE audio upscaling, multipoint connection (switches between laptop and phone seamlessly), and built-in microphone for online team meetings. Handover at IITB library.",
      price: 2100.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Competitive Programming & Distributed Systems Handwritten Master Notes",
      description: "Curated collection of 150+ LeetCode Hard and Codeforces Master level algorithms with proofs, trade-offs, and micro-optimizations. Prepared during ICPC practice sessions.",
      price: 450.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: notesCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Yonex Muscle Power 29 Lite Badminton Racquet with Full Cover",
      description: "High tension graphite frame (28 lbs strung with BG65 string), isometric head shape for enlarged sweet spot. Excellent balance for intermediate hostel and Gymkhana players.",
      price: 1100.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: sportsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 6. NIT HAMIRPUR (nith.ac.in)
    // ==========================================
    {
      title: "ASUS TUF Gaming F15 (Intel Core i5 11th Gen / 16GB RAM / 512GB SSD / GTX 1650)",
      description: "Selling my gaming and simulation laptop before graduation. 144Hz Full HD IPS display, dual fans with anti-dust tunnels, RGB backlit keyboard. Smoothly runs MATLAB, AutoCAD, and games like GTA V and Valorant. Handover at NITH student activity centre.",
      price: 33500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: electronicsCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Modern Digital Electronics by R.P. Jain (4th Edition - McGraw Hill)",
      description: "Standard text for Digital Electronics and Logic Design across Indian universities. Explains Boolean Algebra, Combinational circuits, Flip-flops, Counters, and VHDL with worked examples.",
      price: 420.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: vikramNith.id,
      categoryId: textbooksCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Firefox Target 29T Alloy Mountain Bicycle with Front Zoom Shox",
      description: "29-inch lightweight alloy frame mountain cycle designed for hilly campus terrain. Equipped with 21-speed Shimano Tourney gears and front/rear mechanical disc brakes. Smooth climbing.",
      price: 5200.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: cyclesCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "4th Semester ECE & CSE Microprocessors & Embedded Systems Notes",
      description: "Detailed architecture diagrams and assembly programming routines for 8085, 8086, and ARM Cortex processors. Clean handwritten notes with past 7 years solved university questions.",
      price: 220.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: notesCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Havells 1500W Waterproof Immersion Water Heater with Shockproof Handle",
      description: "Essential hostel item for cold Hamirpur winters. Heavy nickel-plated heating element with bucket clip and heat indicator light. Tested and completely safe.",
      price: 350.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: hostelCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 7. METROPOLITAN ENGINEERING COLLEGE (campus.edu)
    // ==========================================
    {
      title: "Dell Latitude 7490 Business Ultrabook (Core i7 8th Gen / 16GB RAM / 256GB SSD)",
      description: "Durable magnesium-alloy business laptop. Intel Core i7-8650U, 16GB DDR4 RAM, 256GB M.2 SSD, 14-inch Full HD matte display. Battery lasts 5+ hours. Includes Dell charger. Handover at Metropolitan college canteen.",
      price: 21500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: electronicsCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Software Engineering: A Practitioner's Approach by Roger Pressman (8th Edition)",
      description: "Definitive textbook on agile methodologies, software requirements, architecture patterns, testing, and project management. Highlighted definitions for semester exams.",
      price: 500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: tanviCampus.id,
      categoryId: textbooksCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Casio fx-82MS 2nd Edition Scientific Calculator",
      description: "Standard 240-function 2-line display scientific calculator. Used for 1st year engineering mathematics and physics practicals. Clean and working on fresh battery.",
      price: 350.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: electronicsCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Standard Pure Cotton Laboratory Coat (Unisex, Size M/L, Clean)",
      description: "100% white cotton lab coat with 3 pockets and college approved buttons. Essential for Chemistry and Physics lab sessions. Freshly washed and ironed.",
      price: 240.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: engineeringCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "1st Year Engineering All-Subjects Solved Notes & Assignment Bundle",
      description: "Comprehensive spiral-bound notes for Basic Electrical, C Programming, Engineering Physics, and Environmental Science. Includes past semester questions with diagrams.",
      price: 290.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: notesCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const item of allListings) {
    await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        condition: item.condition,
        transactionType: item.transactionType,
        status: item.status,
        campusOnly: item.campusOnly,
        userId: item.userId,
        categoryId: item.categoryId,
        collegeDomainId: item.collegeDomainId,
        images: {
          create: [{ url: item.imageUrl, displayOrder: 0 }],
        },
      },
    });
  }

  console.log(`✓ Seeded ${allListings.length} rich demo products across all 7 college campuses!`);
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
