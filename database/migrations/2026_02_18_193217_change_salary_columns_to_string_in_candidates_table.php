<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('current_salary')->nullable()->change();
            $table->string('expected_salary')->nullable()->change();
            // Also ensure we can store text if user enters it
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Reverting to decimal might cause data loss if text data is present, so be careful.
            // But for down migration we attempt to revert.
            $table->decimal('current_salary', 15, 2)->nullable()->change();
            $table->decimal('expected_salary', 15, 2)->nullable()->change();
        });
    }
};
