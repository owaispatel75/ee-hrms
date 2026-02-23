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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('blood_group')->nullable();
            $table->string('process')->nullable();
            $table->date('date_of_exit')->nullable();
            $table->string('personal_email')->nullable();
            $table->string('qualification')->nullable();
            $table->string('adhar_no', 50)->nullable();
            $table->string('pan_no', 50)->nullable();
            $table->string('uan', 50)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'blood_group',
                'process',
                'date_of_exit',
                'personal_email',
                'qualification',
                'adhar_no',
                'pan_no',
                'uan'
            ]);
        });
    }
};
