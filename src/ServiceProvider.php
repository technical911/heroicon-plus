<?php

namespace Technical911\HeroiconPlus;

use Statamic\Providers\AddonServiceProvider;
use Statamic\Statamic;
use Technical911\HeroiconPlus\Console\PublishHeroicons;
use Technical911\HeroiconPlus\Fieldtypes\HeroiconPlus;

/**
 * Service provider for the Heroicon Plus Statamic addon.
 *
 * This provider registers the addon's fieldtypes, commands, routes, and assets.
 * It handles:
 * - Registering the HeroiconPlus fieldtype for use in blueprints
 * - Registering the publish command for icon assets
 * - Loading Control Panel routes for custom icon management
 * - Publishing icon assets and configuration files
 * - Loading the Vue.js bundle for the Control Panel interface
 *
 * @package Technical911\HeroiconPlus
 */
class ServiceProvider extends AddonServiceProvider
{
    /**
     * Fieldtypes provided by this addon.
     *
     * @var array<class-string>
     */
    protected $fieldtypes = [
        HeroiconPlus::class,
    ];

    /**
     * Artisan commands provided by this addon.
     *
     * @var array<class-string>
     */
    protected $commands = [
        PublishHeroicons::class,
    ];

    /**
     * Control Panel routes file.
     *
     * @var array<string, string>
     */
    protected $routes = [
        'cp' => __DIR__ . '/../routes/cp.php',
    ];

    /**
     * Boot the addon and register all publishable assets.
     *
     * This method:
     * - Registers the Vue.js bundle for the Control Panel fieldtype interface
     * - Publishes the Heroicons library SVG files to the public directory
     * - Merges and publishes the configuration file for customization
     *
     * @return void
     */
    public function bootAddon()
    {
        // Register the Control Panel JavaScript bundle
        // This loads the Vue component for the icon picker interface
        // The path is relative to the Statamic addons directory
        Statamic::vite('heroicon-plus-cp', 'addons/technical911/heroicon-plus/resources/js/heroicons-cp.js');

        // Publish Heroicons SVG library to public directory
        // These icons are served from /vendor/technical911-heroicon-plus/{size}/{style}/{name}.svg
        // Users can run: php artisan vendor:publish --tag=technical911-heroicon-plus-icons
        $this->publishes([
            __DIR__ . '/../resources/icons' => public_path('vendor/technical911-heroicon-plus'),
        ], 'technical911-heroicon-plus-icons');

        // Merge package config with application config
        // Allows users to override settings in their own config file
        $this->mergeConfigFrom(__DIR__ . '/../config/heroicon-plus.php', 'technical911-heroicon-plus');

        // Publish configuration file for user customization
        // Users can run: php artisan vendor:publish --tag=technical911-heroicon-plus-config
        $this->publishes([
            __DIR__ . '/../config/heroicon-plus.php' => config_path('technical911-heroicon-plus.php'),
        ], 'technical911-heroicon-plus-config');
    }
}
