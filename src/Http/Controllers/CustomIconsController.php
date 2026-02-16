<?php

namespace Technical911\HeroiconPlus\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Statamic\Http\Controllers\CP\CpController;

/**
 * Control Panel controller for managing custom icon assets.
 *
 * This controller provides an API endpoint for the Vue component to fetch
 * a list of custom SVG icons uploaded to the public/assets/icons directory.
 * It also ensures the directory exists and reports if it was newly created.
 *
 * @package Technical911\HeroiconPlus\Http\Controllers
 */
class CustomIconsController extends CpController
{
    /**
     * Retrieve a list of all custom SVG icons in the assets/icons directory.
     *
     * This endpoint:
     * - Ensures the public/assets/icons directory exists (creates if needed)
     * - Scans for all SVG files in the directory
     * - Returns a sorted list of icon names (without .svg extension)
     * - Indicates whether the directory was just created
     *
     * This is called by the Vue fieldtype component when the "custom" tab is selected,
     * or when the user clicks "Refresh" to reload the custom icon list.
     *
     * @return JsonResponse JSON response containing:
     *                      - icons: array of icon names (without .svg extension)
     *                      - created: boolean indicating if directory was just created
     *                      - path: string path to the icons directory
     */
    public function index(): JsonResponse
    {
        // Define the custom icons directory path
        $dir = public_path('assets/icons');

        $created = false;

        // Ensure the directory exists; create it if missing
        if (! File::isDirectory($dir)) {
            File::ensureDirectoryExists($dir);
            $created = true;
        }

        // Scan the directory for SVG files and extract icon names
        $icons = collect(File::files($dir))
            ->filter(fn ($f) => strtolower($f->getExtension()) === 'svg')
            ->map(fn ($f) => $f->getBasename('.svg'))
            ->sort()
            ->values()
            ->all();

        return response()->json([
            'icons' => $icons,       // List of available custom icon names
            'created' => $created,   // Whether the directory was just created
            'path' => '/assets/icons', // Public path to the icons
        ]);
    }
}
