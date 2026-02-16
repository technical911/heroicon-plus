<?php

namespace Technical911\HeroiconPlus\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

/**
 * Artisan command to publish Heroicons assets and generate searchable icon indexes.
 *
 * This command performs two main operations:
 * 1. Publishes SVG icon files from the package to the application's public directory
 * 2. Generates JSON index files that list all available icons for each style (solid, outline, mini, micro)
 *
 * @package Technical911\HeroiconPlus\Console
 */
class PublishHeroicons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'technical911-heroicon-plus:publish {--force : Overwrite published files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish Heroicons assets and generate icon index JSON files.';

    /**
     * Execute the console command.
     *
     * This method:
     * - Publishes icon assets using Laravel's vendor:publish system
     * - Scans the icon directories for each style (solid, outline, mini, micro)
     * - Generates JSON index files containing sorted lists of available icon names
     * - Outputs progress information to the console
     *
     * @return int Command exit code (SUCCESS on completion)
     */
    public function handle(): int
    {
        // Step 1: Publish icon files to the application's public directory
        $args = ['--tag' => 'technical911-heroicon-plus-icons'];

        // Include --force flag if specified to overwrite existing published files
        if ($this->option('force')) {
            $args['--force'] = true;
        }

        $this->info('Publishing icons...');
        Artisan::call('vendor:publish', $args);
        $this->line(Artisan::output());

        // Step 2: Generate JSON index files from the addon source folders
        // The base directory contains all icon styles organized by size and type
        $base = base_path('addons/technical911/heroicon-plus/resources/icons');

        // Map style names to their respective directory paths
        // Each style corresponds to a specific size and variant:
        // - solid: 24x24 filled icons
        // - outline: 24x24 stroke icons
        // - mini: 20x20 filled icons
        // - micro: 16x16 filled icons
        $maps = [
            'solid'   => $base.'/24/solid',
            'outline' => $base.'/24/outline',
            'mini'    => $base.'/20/solid',
            'micro'   => $base.'/16/solid',
        ];

        // Ensure the output directory for index files exists
        $outDir = $base.'/indexes';
        File::ensureDirectoryExists($outDir);

        // Process each icon style to generate its index
        foreach ($maps as $style => $dir) {
            // Skip if the directory doesn't exist
            if (! File::isDirectory($dir)) {
                $this->warn("Missing directory: {$dir} (skipping {$style})");
                continue;
            }

            // Scan the directory and extract icon names (without .svg extension)
            // Filter for SVG files only, extract basenames, sort alphabetically
            $names = collect(File::files($dir))
                ->filter(fn ($f) => strtolower($f->getExtension()) === 'svg')
                ->map(fn ($f) => $f->getBasename('.svg'))
                ->sort()
                ->values()
                ->all();

            // Write the sorted icon names to a JSON file
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
