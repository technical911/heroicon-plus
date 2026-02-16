<?php

/**
 * Control Panel routes for the Heroicon Plus addon.
 *
 * These routes are automatically registered with the 'statamic.cp.' prefix
 * and are protected by Statamic's Control Panel authentication middleware.
 *
 * @package Technical911\HeroiconPlus
 */

use Illuminate\Support\Facades\Route;
use Technical911\HeroiconPlus\Http\Controllers\CustomIconsController;

// API endpoint to retrieve custom icons from public/assets/icons
// Called by the Vue fieldtype component when "custom" tab is selected
Route::get('technical911/heroicons/custom-icons', [CustomIconsController::class, 'index'])
    ->name('technical911.heroicons.custom-icons');
