<?php


use Illuminate\Support\Facades\Route;
use Technical911\HeroiconPlus\Http\Controllers\CustomIconsController;

Route::get('technical911/heroicons/custom-icons', [CustomIconsController::class, 'index'])
    ->name('technical911.heroicons.custom-icons');
