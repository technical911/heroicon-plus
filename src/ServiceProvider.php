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
        // The entry path is relative to the Laravel app root.
        // The second argument identifies the Vite build directory/package context.
        // In development, this vendor path may be a Composer symlink to the addon repo.
        // In production, it is the real Composer-installed package path.
        Statamic::vite(
            'heroicon-plus-cp',
            'vendor/technical911/heroicon-plus/resources/js/heroicons-cp.js'
        );

        $this->publishes([
            __DIR__ . '/../resources/icons' => public_path('vendor/technical911-heroicon-plus'),
        ], 'technical911-heroicon-plus-icons');

        $this->mergeConfigFrom(__DIR__ . '/../config/heroicon-plus.php', 'technical911-heroicon-plus');

        $this->publishes([
            __DIR__ . '/../config/heroicon-plus.php' => config_path('technical911-heroicon-plus.php'),
        ], 'technical911-heroicon-plus-config');
    }
}
