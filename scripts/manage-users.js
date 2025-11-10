#!/usr/bin/env node

import UserManager from '../backend/auth/UserManager.js';
import readline from 'readline';
import bcrypt from 'bcryptjs';

/**
 * CLI User Management Tool
 * Created: November 6, 2025
 * Security Fix #4
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
    console.log('\n=== Create New User ===');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const role = await question('Role (user/admin/moderator) [user]: ') || 'user';
    
    const result = await UserManager.createUser(username, email, password, role);
    
    if (result.success) {
        console.log('✅ User created successfully!');
        console.log('User ID:', result.user.user_id);
    } else {
        console.log('❌ Error:', result.error);
    }
}

async function createDefaultAdmin() {
    console.log('\n=== Creating Default Admin User ===');
    
    const defaultPassword = 'ChangeMe123!';
    const result = await UserManager.createUser(
        'admin',
        'admin@theexpanse.local',
        defaultPassword,
        'admin'
    );
    
    if (result.success) {
        console.log('✅ Default admin user created!');
        console.log('Username: admin');
        console.log('Password:', defaultPassword);
        console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    } else {
        console.log('❌ Error:', result.error);
    }
}

async function listUsers() {
    console.log('\n=== All Users ===');
    const users = await UserManager.listUsers();
    
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        console.table(users.map(u => ({
            ID: u.user_id,
            Username: u.username,
            Email: u.email,
            Role: u.role,
            Active: u.is_active ? '✓' : '✗',
            'Last Login': u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'
        })));
    }
}

async function main() {
    console.log('\n🔐 Expanse User Management Tool\n');
    
    console.log('1. Create new user');
    console.log('2. Create default admin');
    console.log('3. List all users');
    console.log('4. Exit\n');
    
    const choice = await question('Select option (1-4): ');
    
    switch(choice) {
        case '1':
            await createUser();
            break;
        case '2':
            await createDefaultAdmin();
            break;
        case '3':
            await listUsers();
            break;
        case '4':
            console.log('Goodbye!');
            process.exit(0);
        default:
            console.log('Invalid option');
    }
    
    // Ask if they want to continue
    const cont = await question('\nContinue? (y/n): ');
    if (cont.toLowerCase() === 'y') {
        await main();
    } else {
        console.log('Goodbye!');
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('Error:', error.message);
    process.exit(1);
});

// Start the CLI
main().catch(console.error);
