<?php

/**
 * Configuration file for Heroicon Plus addon.
 *
 * This file can be published to the application's config directory using:
 * php artisan vendor:publish --tag=technical911-heroicon-plus-config
 *
 * After publishing, users can customize these settings in their own
 * config/technical911-heroicon-plus.php file.
 *
 * @package Technical911\HeroiconPlus
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Public Path for Published Icons
    |--------------------------------------------------------------------------
    |
    | The public web path where Heroicons SVG files are published.
    | This path is used by the fieldtype's augment() method to generate
    | full URLs to icon files.
    |
    | Default: '/vendor/technical911-heroicon-plus'
    |
    | The icons are organized by size and style:
    | - /vendor/technical911-heroicon-plus/24/solid/{name}.svg
    | - /vendor/technical911-heroicon-plus/24/outline/{name}.svg
    | - /vendor/technical911-heroicon-plus/20/solid/{name}.svg (mini)
    | - /vendor/technical911-heroicon-plus/16/solid/{name}.svg (micro)
    |
    */
    'public_path' => '/vendor/technical911-heroicon-plus',
];
