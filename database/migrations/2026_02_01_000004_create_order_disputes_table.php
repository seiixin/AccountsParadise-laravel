<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('status');
            $table->string('reason')->nullable();
            $table->text('description')->nullable();
            $table->text('resolution')->nullable();
            $table->text('decision_notes')->nullable();
            $table->foreignId('decided_by_id')->nullable()->constrained('users');
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('order_disputes');
    }
};
