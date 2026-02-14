<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Create unique users with different usernames and emails
        User::factory()->create([
            'name' => 'John Buyer',
            'username' => 'johnbuyer' . now()->timestamp, // Unique username with timestamp
            'email' => 'johnbuyer' . now()->timestamp . '@example.com', // Unique email
            'password' => bcrypt('password123'), // Always hash passwords
            'role' => 'buyer',
        ]);

        User::factory()->create([
            'name' => 'Alex midman',
            'username' => 'alexmidman' . now()->timestamp, // Unique username with timestamp
            'email' => 'alexmidman' . now()->timestamp . '@example.com', // Unique email
            'password' => bcrypt('password123'),
            'role' => 'midman',
        ]);

        User::factory()->create([
            'name' => 'Maria Merchant',
            'username' => 'mariamerchant' . now()->timestamp, // Unique username with timestamp
            'email' => 'mariamerchant' . now()->timestamp . '@example.com', // Unique email
            'password' => bcrypt('password123'),
            'role' => 'merchant',
        ]);
    }
}
