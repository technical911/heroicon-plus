<?php

namespace Technical911\HeroiconPlus\Fieldtypes;

use Statamic\Fields\Fieldtype;

/**
 * Statamic fieldtype for selecting Heroicons or custom SVG icons.
 *
 * This fieldtype provides a Vue-powered icon picker interface in the Statamic Control Panel
 * that allows users to select from Heroicons (solid, outline, mini, micro) or custom uploaded icons.
 * The selected value is stored as "style:name" format and augmented to a public URL path.
 *
 * @package Technical911\HeroiconPlus\Fieldtypes
 */
class HeroiconPlus extends Fieldtype
{
    /**
     * The Vue component name for the fieldtype.
     * This must match the component registered in heroicons-cp.js.
     *
     * @var string
     */
    protected $component = 'heroicon_plus';

    /**
     * The unique handle for this fieldtype.
     *
     * @var string
     */
    protected static $handle = 'heroicon_plus';

    /**
     * Augment the stored value into a public URL path for the selected icon.
     *
     * The stored value format is "style:name" (e.g., "solid:academic-cap" or "custom:my-logo").
     * This method transforms it into a full public path to the SVG file that can be used
     * in templates (e.g., "/vendor/technical911-heroicon-plus/24/solid/academic-cap.svg").
     *
     * For custom icons, the path is "/assets/icons/{name}.svg".
     * For Heroicons, the path maps to the published vendor directory based on style:
     * - solid: 24/solid
     * - outline: 24/outline
     * - mini: 20/solid
     * - micro: 16/solid
     *
     * @param mixed $value The stored fieldtype value (expected format: "style:name")
     * @return string|null The public URL path to the icon SVG file, or null if invalid
     */
    public function augment($value)
    {
        // Return null for empty or non-string values
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        // Parse the "style:name" format
        [$style, $name] = array_pad(explode(':', $value, 2), 2, null);

        // Apply defaults
        $style = $style ?: 'solid';
        $name = $name ?: null;

        // Return null if no icon name was provided
        if (! $name) {
            return null;
        }

        // Handle custom icons from the public/assets/icons directory
        if ($style === 'custom') {
            return "/assets/icons/{$name}.svg";
        }

        // Map Heroicon styles to their directory structure
        $map = [
            'solid'   => '24/solid',   // 24x24 filled icons
            'outline' => '24/outline', // 24x24 stroke icons
            'mini'    => '20/solid',   // 20x20 filled icons
            'micro'   => '16/solid',   // 16x16 filled icons
        ];

        $folder = $map[$style] ?? '24/solid';

        // Get the base public path from config (allows customization)
        $base = config('technical911-heroicon-plus.public_path', '/vendor/technical911-heroicon-plus');

        return rtrim($base, '/') . "/{$folder}/{$name}.svg";
    }
}
