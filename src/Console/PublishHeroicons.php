<?php

namespace Technical911\HeroiconPlus\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class PublishHeroicons extends Command
{
    protected $signature = 'technical911-heroicon-plus:publish {--force : Overwrite published files}';

    protected $description = 'Publish Heroicons assets and generate icon index JSON files.';

    public function handle(): int
    {
        // 1) Publish icons
        $args = ['--tag' => 'technical911-heroicon-plus-icons'];

        if ($this->option('force')) {
            $args['--force'] = true;
        }

        $this->info('Publishing icons...');
        Artisan::call('vendor:publish', $args);
        $this->line(Artisan::output());

        // 2) Generate JSON indices from the addon source folders (keeps original structure)
        $base = base_path('addons/technical911/heroicon-plus/resources/icons');

        $maps = [
            'solid'   => $base.'/24/solid',
            'outline' => $base.'/24/outline',
            'mini'    => $base.'/20/solid',
            'micro'   => $base.'/16/solid',
        ];

        $outDir = $base.'/indexes';
        File::ensureDirectoryExists($outDir);

        foreach ($maps as $style => $dir) {
            if (! File::isDirectory($dir)) {
                $this->warn("Missing directory: {$dir} (skipping {$style})");
                continue;
            }

            $names = collect(File::files($dir))
                ->filter(fn ($f) => strtolower($f->getExtension()) === 'svg')
                ->map(fn ($f) => $f->getBasename('.svg'))
                ->sort()
                ->values()
                ->all();

            File::put(
                "{$outDir}/{$style}.json",
                json_encode($names, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            );

            $this->info("Wrote index: {$outDir}/{$style}.json (".count($names)." icons)");
        }

        $this->info('Done.');
        return self::SUCCESS;
    }
}
