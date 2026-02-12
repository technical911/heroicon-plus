<?php

namespace Technical911\HeroiconPlus\Fieldtypes;

use Statamic\Fields\Fieldtype;

class HeroiconPlus extends Fieldtype
{
    // This must match the Vue component name we register in JS.
    protected $component = 'heroicon_plus';

    protected static $handle = 'heroicon_plus';

    public function augment($value)
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        // Expect "style:name"
        [$style, $name] = array_pad(explode(':', $value, 2), 2, null);

        $style = $style ?: 'solid';
        $name = $name ?: null;

        if (! $name) {
            return null;
        }

        // ✅ handle custom icons
        if ($style === 'custom') {
            return "/assets/icons/{$name}.svg";
        }

        $map = [
            'solid'   => '24/solid',
            'outline' => '24/outline',
            'mini'    => '20/solid',
            'micro'   => '16/solid',
        ];

        $folder = $map[$style] ?? '24/solid';

        $base = config('technical911-heroicon-plus.public_path', '/vendor/technical911-heroicon-plus');

        return rtrim($base, '/') . "/{$folder}/{$name}.svg";
    }
}
