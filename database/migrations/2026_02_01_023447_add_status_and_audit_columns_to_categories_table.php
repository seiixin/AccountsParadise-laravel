<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {

            // Category approval status
            $table->string('status')
                ->default('pending')
                ->after('name');

            // Who created the category (merchant)
            $table->unsignedBigInteger('created_by_id')
                ->nullable()
                ->after('status');

            // Who approved/rejected the category (admin)
            $table->unsignedBigInteger('approved_by_id')
                ->nullable()
                ->after('created_by_id');

            $table->timestamp('approved_at')
                ->nullable()
                ->after('approved_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'created_by_id',
                'approved_by_id',
                'approved_at',
            ]);
        });
    }
};
