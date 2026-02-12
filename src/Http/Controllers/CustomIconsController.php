<?php

namespace Technical911\HeroiconPlus\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Statamic\Http\Controllers\CP\CpController;

class CustomIconsController extends CpController
{
    public function index(): JsonResponse
    {
        $dir = public_path('assets/icons');

        $created = false;

        if (! File::isDirectory($dir)) {
            File::ensureDirectoryExists($dir);
            $created = true;
        }

        $icons = collect(File::files($dir))
            ->filter(fn ($f) => strtolower($f->getExtension()) === 'svg')
            ->map(fn ($f) => $f->getBasename('.svg'))
            ->sort()
            ->values()
            ->all();

        return response()->json([
            'icons' => $icons,
            'created' => $created,
            'path' => '/assets/icons',
        ]);
    }
}
