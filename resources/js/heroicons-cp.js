/**
 * Heroicon Plus Control Panel JavaScript Bundle
 *
 * This file registers the Vue.js fieldtype component for the Statamic Control Panel.
 * It provides an icon picker interface with support for:
 * - Heroicons library (solid, outline, mini, micro styles)
 * - Custom uploaded SVG icons
 * - Real-time search/filtering
 * - Embedded asset manager for uploading custom icons
 *
 * @package Technical911\HeroiconPlus
 */

// Import pre-generated JSON indexes of available Heroicons
// These files are created by the PublishHeroicons command
import solidIcons from '../icons/indexes/solid.json';
import outlineIcons from '../icons/indexes/outline.json';
import miniIcons from '../icons/indexes/mini.json';
import microIcons from '../icons/indexes/micro.json';

/**
 * IIFE to apply embedded mode styles when Asset Manager is loaded in an iframe.
 *
 * When the custom icon manager is opened, it loads the Statamic Asset Manager
 * in an iframe with ?embedded=1 query parameter. This code detects that parameter
 * and injects CSS to hide the Control Panel chrome (sidebar, header, etc.),
 * making the Asset Manager fill the entire iframe cleanly.
 *
 * This provides a seamless experience for uploading custom SVG icons directly
 * within the icon picker modal.
 */
(function () {
    try {
        // Check for the embedded query parameter
        const params = new URLSearchParams(window.location.search);
        const embedded = params.get('embedded') === '1';

        // Exit early if not in embedded mode
        if (!embedded) return;

        // Only apply styles when actually inside an iframe
        if (window.self === window.top) return;

        // Create a style element to inject embedded mode CSS
        const style = document.createElement('style');
        style.setAttribute('data-technical911-embedded', '1');

        // CSS to hide Statamic Control Panel UI elements in embedded mode
        // These selectors target common Statamic CP layout elements
        style.textContent = `
                  /* Embedded-only: remove CP chrome */
                  header, .topbar, .header, .nav-main, .nav, aside, .sidebar, [class*="nav"], [class*="sidebar"] {
                    display: none !important;
                  }

                  /* Kill any reserved sidebar space on common wrappers */
                  html, body, #app {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: auto !important;
                  }

                  /* Force full-width on likely layout containers */
                /* Embedded: remove reserved nav gutter (was 14rem) */
                    #main .workspace {
                      padding-left: 0 !important;
                      margin-left: 0 !important;
                    }

                    /* Remove top header bar with other functional buttons */
                    /* Embedded: remove CP top chrome inside iframe */
                    #statamic .global-header {
                      display: none !important;
                    }

                    /* Embedded: remove reserved space for global header */
                    #statamic,
                    #statamic #main,
                    #statamic .workspace {
                      padding-top: 0 !important;
                      margin-top: 0 !important;
                      top: 0 !important;
                    }

                    /* If a CSS variable controls header height, neutralize it */
                    #statamic {
                      --global-header-height: 0px !important;
                    }

                    /* Embedded: hide "Create Container" button */
                    #statamic a[href$="/cp/asset-containers/create"] {
                      display: none !important;
                    }

                    #statamic .workspace .dropdown-list {
                      display: none !important;
                    }

                  /* If CP uses a two-column grid/flex layout, collapse it */
                  .page-wrapper, .page, .layout, .cp, .container {
                    grid-template-columns: 1fr !important;
                  }

                  /* Remove common "gutter" padding */
                  .content, .page, main, [role="main"] {
                    padding: 0 !important;
                  }

                  /* Remove any "frame" background showing through */
                  body { background: #fff !important; }
                `;

        // Inject the styles into the document head
        document.head.appendChild(style);
    } catch (e) {
        // Silently fail if there's any error (e.g., in older browsers)
    }
})();

/**
 * Register the Heroicon Plus fieldtype component with Statamic.
 *
 * This component is registered during Statamic's boot process and will be
 * available for use in blueprints with the handle 'heroicon_plus'.
 */
Statamic.booting(() => {
    Statamic.component('heroicon_plus-fieldtype', {
        // Use Statamic's Fieldtype mixin for standard fieldtype functionality
        mixins: [Fieldtype],

        /**
         * Component data initialization.
         *
         * @returns {Object} Initial component state
         */
        data() {
            // Parse the initial value from the field (format: "style:name")
            const parsed = this.parseValue(this.value);

            return {
                customIcons: [],              // Array of custom icon names loaded from API
                customLoaded: false,          // Whether custom icons have been loaded
                customLoading: false,         // Whether custom icons are currently loading
                isOpen: false,                // Whether the picker modal is open
                customCreated: false,         // Whether the custom icons directory was just created
                query: '',                    // Search query for filtering icons
                showAssetManager: false,      // Whether the embedded Asset Manager iframe is visible
                styles: ['outline', 'solid', 'mini', 'micro', 'custom'], // Available icon styles
                activeStyle: parsed.style || 'solid', // Currently selected style
                name: parsed.name || '',      // Currently selected icon name
                iconsByStyle: {
                    solid: solidIcons,        // Pre-loaded solid icons from JSON
                    outline: outlineIcons,    // Pre-loaded outline icons from JSON
                    mini: miniIcons,          // Pre-loaded mini icons from JSON
                    micro: microIcons,        // Pre-loaded micro icons from JSON
                },
            };
        },

        computed: {
            /**
             * Compute the stored value format for the fieldtype.
             *
             * Converts the selected style and name into "style:name" format
             * that will be saved to the entry's data.
             *
             * @returns {string} The formatted value (e.g., "solid:academic-cap")
             */
            storedValue() {
                if (!this.name) return '';
                return `${this.activeStyle}:${this.name}`;
            },

            /**
             * Filter icons based on the current search query.
             *
             * Returns icons from either the custom icons array (for custom style)
             * or the pre-loaded Heroicons arrays (for other styles).
             * Filters the list based on the search query if one is provided.
             *
             * @returns {Array<string>} Filtered array of icon names
             */
            filteredIcons() {
                // Get the appropriate icon list based on active style
                const list =
                    this.activeStyle === 'custom'
                        ? (this.customIcons || [])
                        : (this.iconsByStyle?.[this.activeStyle] || []);

                // Apply search filter if query exists
                const q = (this.query || '').toLowerCase().trim();
                if (!q) return list;
                return list.filter((n) => n.toLowerCase().includes(q));
            },
        },

        watch: {
            /**
             * Watch for external value changes (e.g., programmatic updates).
             *
             * Re-parses the value and updates the component state accordingly.
             *
             * @param {string} newVal The new value
             */
            value(newVal) {
                const parsed = this.parseValue(newVal);
                this.activeStyle = parsed.style || this.activeStyle || 'solid';
                this.name = parsed.name || '';
            },
        },

        methods: {
            /**
             * Parse the stored value format into style and name components.
             *
             * Handles the "style:name" format (e.g., "solid:academic-cap").
             * Returns default values for invalid or empty inputs.
             *
             * @param {*} val The value to parse
             * @returns {Object} Object with style and name properties
             */
            parseValue(val) {
                if (!val) return { style: 'solid', name: '' };
                if (typeof val !== 'string') return { style: 'solid', name: '' };

                const idx = val.indexOf(':');
                if (idx === -1) return { style: 'solid', name: val };

                return {
                    style: val.slice(0, idx) || 'solid',
                    name: val.slice(idx + 1) || '',
                };
            },

            /**
             * Open the icon picker modal.
             *
             * If the custom style is active, also triggers loading of custom icons
             * from the server.
             */
            open() {
                this.isOpen = true;
                if (this.activeStyle === 'custom') this.loadCustomIcons();
            },

            /**
             * Show the embedded Asset Manager iframe for uploading custom icons.
             */
            openCustomManager() {
                this.showAssetManager = true;
            },

            /**
             * Close the Asset Manager and refresh the custom icons list.
             *
             * Called when the user clicks "Done" after uploading icons.
             * Forces a refresh to show newly uploaded icons.
             */
            closeCustomManager() {
                this.showAssetManager = false;
                this.loadCustomIcons(true); // Force refresh to load new uploads
            },

            /**
             * Close the icon picker modal and reset state.
             */
            close() {
                this.isOpen = false;
                this.query = '';
                this.showAssetManager = false;
            },

            /**
             * Switch to a different icon style tab.
             *
             * Clears the search query and loads custom icons if switching to custom style.
             *
             * @param {string} style The style to switch to (solid, outline, mini, micro, custom)
             */
            setStyle(style) {
                this.showAssetManager = false;
                this.activeStyle = style;
                this.query = '';

                // Load custom icons when switching to custom tab
                if (style === 'custom') {
                    this.loadCustomIcons();
                }
            },

            /**
             * Select an icon and close the picker.
             *
             * Emits the input event to update the field value in Statamic.
             *
             * @param {string} iconName The name of the icon to select
             */
            pick(iconName) {
                this.name = iconName;
                this.$emit('input', this.storedValue);
                this.close();
            },

            /**
             * Clear the selected icon.
             *
             * Resets the field to an empty value.
             */
            clear() {
                this.name = '';
                this.$emit('input', '');
            },

            /**
             * Generate the public URL for an icon's SVG file.
             *
             * Returns different paths based on whether it's a custom icon
             * or a Heroicons library icon.
             *
             * @param {string} style The icon style
             * @param {string} name The icon name
             * @returns {string} Public URL to the SVG file
             */
            svgUrl(style, name) {
                // Custom icons are served from /assets/icons/
                if (style === 'custom') {
                    return `/assets/icons/${name}.svg`;
                }

                // Map Heroicons styles to their directory structure
                const map = {
                    solid:  '24/solid',
                    outline:'24/outline',
                    mini:   '20/solid',
                    micro:  '16/solid',
                };

                const folder = map[style] || '24/solid';
                return `/vendor/technical911-heroicon-plus/${folder}/${name}.svg`;
            },

            /**
             * Load custom icons from the server via API.
             *
             * Fetches the list of SVG files from public/assets/icons directory.
             * Uses caching to avoid unnecessary requests unless forced.
             *
             * @param {boolean} force Whether to force reload even if already loaded
             * @returns {Promise<void>}
             */
            async loadCustomIcons(force = false) {
                // Skip if already loaded/loading (unless forced)
                if (!force && (this.customLoaded || this.customLoading)) return;

                this.customLoading = true;

                try {
                    // Use Statamic's axios instance if available, otherwise fall back to window.axios
                    const http = (Statamic && Statamic.$axios)
                        ? Statamic.$axios
                        : window.axios;

                    // Fetch custom icons from the Control Panel API endpoint
                    const res = await http.get('/cp/technical911/heroicons/custom-icons');

                    // Update state with the response data
                    this.customIcons = res?.data?.icons || [];
                    this.customCreated = !!res?.data?.created;
                    this.customLoaded = true;

                } catch (e) {
                    // Log error and set safe defaults on failure
                    console.error('Failed loading custom icons', e);
                    this.customIcons = [];
                    this.customCreated = false;
                    this.customLoaded = true;

                } finally {
                    this.customLoading = false;
                }
            },


        },

        /**
         * Inline Vue template for the fieldtype component.
         *
         * Structure:
         * 1. Compact field display showing current selection
         * 2. Modal picker with:
         *    - Style tabs (outline, solid, mini, micro, custom)
         *    - Search input
         *    - Custom icon management buttons (for custom style)
         *    - Embedded Asset Manager iframe (when uploading)
         *    - Scrollable grid of icon previews
         */
        template: `
            <div style="margin-bottom: 8px;">
                <!-- Compact field UI showing current selection -->
                <div style="display:flex; align-items:center; gap:8px; margin-bottom: 8px;">
                    <div
                        style="display:flex; align-items:center; gap:8px; padding:6px 8px; border:1px solid rgba(0,0,0,.15); border-radius:6px; min-width:220px;"
                    >
                        <img
                            v-if="name"
                            :src="svgUrl(activeStyle, name)"
                            alt=""
                            style="width:18px; height:18px;"
                        />
                        <span v-if="name" style="font-size:12px;">{{ activeStyle }}:{{ name }}</span>
                        <span v-else style="font-size:12px; opacity:.7;">(no icon selected)</span>
                    </div>

                    <button type="button" class="btn btn-sm" @click="open">Choose…</button>

                    <button
                        v-if="name"
                        type="button"
                        class="btn btn-sm"
                        @click="clear"
                        title="Clear selection"
                    >Clear</button>
                </div>

                <!-- Modal picker -->
                <modal
                    v-if="isOpen"
                    name="heroicon-picker"
                    width="820px"
                    height="640px"
                    @closed="close"
                >
                    <div slot-scope="{ close }" style="padding:12px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px;">
                            <h2 style="font-size:14px; font-weight:600; margin:0;">Choose a Heroicon</h2>
                            <button type="button" class="btn btn-sm" @click="close">Close</button>
                        </div>

                        <!-- Tabs + search -->
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom: 10px;">
                            <div v-if="activeStyle === 'custom' && customCreated" style="font-size:12px; opacity:.7; margin-bottom:8px;">
                                Icons folder was created at <code>/public/assets/icons</code>. Upload SVGs via the Assets screen, then hit Refresh.
                            </div>
                            <button
                                v-for="s in styles"
                                :key="s"
                                type="button"
                                class="btn btn-sm"
                                :class="s === activeStyle ? 'btn-primary' : ''"
                                @click="setStyle(s)"
                            >{{ s }}</button>

                            <div style="flex:1;"></div>
                            <div v-if="activeStyle === 'custom'" style="display:flex; align-items:center; gap:8px;">
                                <button
                                    v-if="activeStyle === 'custom'"
                                    type="button"
                                    class="btn btn-sm"
                                    @click="showAssetManager = true"
                                >
                                    Manage / Upload
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-sm"
                                    @click="loadCustomIcons(true)"
                                    :disabled="customLoading"
                                >
                                    {{ customLoading ? 'Refreshing…' : 'Refresh' }}
                                </button>
                            </div>

                            <input
                                type="text"
                                class="input-text"
                                style="width:260px;"
                                v-model="query"
                                placeholder="Search icons…"
                            />
                        </div>

                        <div v-if="showAssetManager" style="margin-bottom: 10px;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                                <div style="font-size:12px; opacity:.8;">
                                    Upload SVGs into <code>assets/icons</code>, then close to refresh.
                                </div>
                                <button type="button" class="btn btn-sm" @click="closeCustomManager">
                                    Done
                                </button>
                            </div>

                            <!-- Embedded Asset Manager iframe with embedded=1 param -->
                            <iframe
                                src="/cp/assets/browse/assets/icons?embedded=1"
                                style="width:100%; height:420px; border:1px solid rgba(0,0,0,.15); border-radius:6px;"
                            ></iframe>
                        </div>

                        <!-- Scrollable grid of icon previews -->
                        <div
                            style="height:520px; overflow:auto; border:1px solid rgba(0,0,0,.15); border-radius:6px; padding:8px;"
                        >
                            <div style="display:grid; grid-template-columns:repeat(8, minmax(0, 1fr)); gap:8px;">
                                <button
                                    v-for="icon in filteredIcons"
                                    :key="icon"
                                    type="button"
                                    :title="icon"
                                    @click="pick(icon)"
                                    style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:52px; border:1px solid rgba(0,0,0,.15); border-radius:6px; background:transparent; cursor:pointer; padding:6px;"
                                >
                                    <img
                                        :src="svgUrl(activeStyle, icon)"
                                        alt=""
                                        style="width:18px; height:18px;"
                                    />
                                    <div
                                        style="margin-top:4px; font-size:10px; line-height:12px; opacity:.75; width:100%; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                                    >
                                        {{ icon }}
                                    </div>
                                </button>
                            </div>

                            <div v-if="filteredIcons.length === 0" style="font-size:12px; opacity:.7; padding:8px;">
                                No icons match "{{ query }}".
                            </div>
                        </div>
                    </div>
                </modal>
            </div>
        `,

    });
});
