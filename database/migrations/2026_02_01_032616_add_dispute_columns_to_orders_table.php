<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('dispute_reason')->nullable();      // Adding dispute_reason column
            $table->text('dispute_description')->nullable();   // Adding dispute_description column
            $table->string('dispute_evidence')->nullable();    // Adding dispute_evidence column
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['dispute_reason', 'dispute_description', 'dispute_evidence']);
        });
    }

};
