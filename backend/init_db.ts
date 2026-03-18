import { db } from "./db";
import { sql } from "drizzle-orm";

async function init() {
  console.log("🛠️ Initializing database tables...");
  
  try {
    const rawSql = `
      DROP TABLE IF EXISTS workflows;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS availability;
      DROP TABLE IF EXISTS bookings;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS services;
      DROP TABLE IF EXISTS staff;
      DROP TABLE IF EXISTS memberships;
      DROP TABLE IF EXISTS workspaces;
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        created_at VARCHAR(50) NOT NULL
      );

      CREATE TABLE workspaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        logo TEXT,
        currency VARCHAR(20) DEFAULT 'USD',
        timezone VARCHAR(50) DEFAULT 'UTC',
        owner_id INT,
        theme JSON
      );

      CREATE TABLE memberships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        workspace_id INT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at VARCHAR(50) NOT NULL
      );

      CREATE TABLE staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar TEXT,
        phone VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        designation VARCHAR(255),
        gender VARCHAR(20),
        date_of_birth VARCHAR(20),
        additional_info TEXT
      );

      CREATE TABLE services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        price INT NOT NULL,
        buffer_time INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        description TEXT,
        image TEXT,
        color VARCHAR(20),
        category VARCHAR(50),
        schedule_type VARCHAR(50),
        staff_ids JSON NOT NULL,
        settings JSON NOT NULL
      );

      CREATE TABLE customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        total_bookings INT DEFAULT 0,
        last_booking VARCHAR(50),
        joined_date VARCHAR(50) NOT NULL
      );

      CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        service_id INT NOT NULL,
        staff_id INT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL DEFAULT '',
        customer_phone VARCHAR(50) NOT NULL DEFAULT '',
        service_name VARCHAR(255) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT
      );

      CREATE TABLE availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT,
        schedule JSON NOT NULL,
        timezone VARCHAR(50) NOT NULL
      );

      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at VARCHAR(50) NOT NULL
      );

      CREATE TABLE workflows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        \`trigger\` VARCHAR(50) NOT NULL,
        settings JSON NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `;

    // Execute statements one by one as multi-statement might be disabled or problematic
    const statements = rawSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing statement: ${statement.substring(0, 50)}...`);
      await db.execute(sql.raw(statement));
    }

    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
}

init();
