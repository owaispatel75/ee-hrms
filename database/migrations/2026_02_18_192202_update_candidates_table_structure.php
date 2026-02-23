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
            $table->unsignedBigInteger('job_id')->nullable()->change();
            $table->unsignedBigInteger('source_id')->nullable()->change();
            $table->string('status')->change(); // Change enum to string if possible, or just modify the column
            $table->string('sourced_by')->nullable()->after('campaign');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->unsignedBigInteger('job_id')->nullable(false)->change();
            $table->unsignedBigInteger('source_id')->nullable(false)->change();
            $table->dropColumn('sourced_by');
            // Reverting status to enum might be complex, skipping for simplicity in down migration or just change back to string
        });
    }
};
