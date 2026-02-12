<?php

namespace Technical911\HeroiconPlus;

use Statamic\Providers\AddonServiceProvider;
use Statamic\Statamic;
use Technical911\HeroiconPlus\Console\PublishHeroicons;
use Technical911\HeroiconPlus\Fieldtypes\HeroiconPlus;

class ServiceProvider extends AddonServiceProvider
{
    protected $fieldtypes = [
        HeroiconPlus::class,
    ];

    protected $commands = [
        PublishHeroicons::class,
    ];

    protected $routes = [
        'cp' => __DIR__ . '/../routes/cp.php',
    ];

    public function bootAddon()
    {
        /**
         * Load CP JS bundle.
         * First arg is the "name" and can be anything unique.
         * Second arg is your vite config (string or array). We pass a config name.
         */
        Statamic::vite('heroicon-plus-cp', 'addons/technical911/heroicon-plus/resources/js/heroicons-cp.js');

        /**
         * Publish icons that ship with the addon (Heroicons library).
         * These are served publicly from /vendor/technical911-heroicon-plus/...
         */
        $this->publishes([
            __DIR__ . '/../resources/icons' => public_path('vendor/technical911-heroicon-plus'),
        ], 'technical911-heroicon-plus-icons');

        /**
         * Optional: publish config so users can override public paths later.
         */
        $this->mergeConfigFrom(__DIR__ . '/../config/heroicon-plus.php', 'technical911-heroicon-plus');

        $this->publishes([
            __DIR__ . '/../config/heroicon-plus.php' => config_path('technical911-heroicon-plus.php'),
        ], 'technical911-heroicon-plus-config');
    }
}
