<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('stage');
            $table->json('delivery_payload')->nullable();
            $table->foreignId('delivered_by_id')->nullable()->constrained('users');
            $table->foreignId('delivered_to_id')->nullable()->constrained('users');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->foreignId('received_by_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('order_deliveries');
    }
};
