import solidIcons from '../icons/indexes/solid.json';
import outlineIcons from '../icons/indexes/outline.json';
import miniIcons from '../icons/indexes/mini.json';
import microIcons from '../icons/indexes/micro.json';


/**
 * First code to hide the side bar if we are opening the assets window in an iframe
 */

(function () {
    try {
        const params = new URLSearchParams(window.location.search);
        const embedded = params.get('embedded') === '1';

        if (!embedded) return;

        // Only apply when we're inside an iframe.
        if (window.self === window.top) return;

        const style = document.createElement('style');
        style.setAttribute('data-technical911-embedded', '1');

        // These selectors may need tweaking if Statamic changes markup.
        // But this keeps the change isolated to embedded mode only.
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


        document.head.appendChild(style);
    } catch (e) {
        // no-op
    }
})();


Statamic.booting(() => {
    Statamic.component('heroicon_plus-fieldtype', {
        mixins: [Fieldtype],

        data() {
            const parsed = this.parseValue(this.value);

            return {
                customIcons: [],
                customLoaded: false,
                customLoading: false,
                isOpen: false,
                customCreated: false,
                query: '',
                showAssetManager: false,
                styles: ['outline', 'solid', 'mini', 'micro', 'custom'],
                activeStyle: parsed.style || 'solid',
                name: parsed.name || '',
                iconsByStyle: {
                    solid: solidIcons,
                    outline: outlineIcons,
                    mini: miniIcons,
                    micro: microIcons,
                },
            };
        },

        computed: {
            storedValue() {
                if (!this.name) return '';
                return `${this.activeStyle}:${this.name}`;
            },

/*            filteredIcons() {
                const list = this.iconsByStyle?.[this.activeStyle] || [];
                const q = (this.query || '').toLowerCase().trim();
                if (!q) return list;
                return list.filter((n) => n.toLowerCase().includes(q));
            },*/
            filteredIcons() {
                const list =
                    this.activeStyle === 'custom'
                        ? (this.customIcons || [])
                        : (this.iconsByStyle?.[this.activeStyle] || []);

                const q = (this.query || '').toLowerCase().trim();
                if (!q) return list;
                return list.filter((n) => n.toLowerCase().includes(q));
            },
        },

        watch: {
            value(newVal) {
                const parsed = this.parseValue(newVal);
                this.activeStyle = parsed.style || this.activeStyle || 'solid';
                this.name = parsed.name || '';
            },
        },

        methods: {
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

            open() {
                this.isOpen = true;
                if (this.activeStyle === 'custom') this.loadCustomIcons();
            },

            openCustomManager() {
                this.showAssetManager = true;
            },

            closeCustomManager() {
                this.showAssetManager = false;
                this.loadCustomIcons(true); // refresh list after user uploads
            },

            close() {
                this.isOpen = false;
                this.query = '';
                this.showAssetManager = false;
            },

            setStyle(style) {
                this.showAssetManager = false;
                this.activeStyle = style;
                this.query = '';

                if (style === 'custom') {
                    this.loadCustomIcons();
                }
            },


            pick(iconName) {
                this.name = iconName;
                this.$emit('input', this.storedValue);
                this.close();
            },

            clear() {
                this.name = '';
                this.$emit('input', '');
            },

            svgUrl(style, name) {
                if (style === 'custom') {
                    return `/assets/icons/${name}.svg`;
                }

                const map = {
                    solid:  '24/solid',
                    outline:'24/outline',
                    mini:   '20/solid',
                    micro:  '16/solid',
                };

                const folder = map[style] || '24/solid';
                return `/vendor/technical911-heroicon-plus/${folder}/${name}.svg`;
            },
            async loadCustomIcons(force = false) {
                if (!force && (this.customLoaded || this.customLoading)) return;

                this.customLoading = true;

                try {
                    const http = (Statamic && Statamic.$axios)
                        ? Statamic.$axios
                        : window.axios;

                    const res = await http.get('/cp/technical911/heroicons/custom-icons');

                    this.customIcons = res?.data?.icons || [];
                    this.customCreated = !!res?.data?.created;
                    this.customLoaded = true;

                } catch (e) {
                    console.error('Failed loading custom icons', e);
                    this.customIcons = [];
                    this.customCreated = false;
                    this.customLoaded = true;

                } finally {
                    this.customLoading = false;
                }
            },


        },

        template: `
            <div style="margin-bottom: 8px;">
                <!-- Compact field UI -->
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

                            <iframe
                                src="/cp/assets/browse/assets/icons?embedded=1"
                                style="width:100%; height:420px; border:1px solid rgba(0,0,0,.15); border-radius:6px;"
                            ></iframe>
                        </div>

                        <!-- Scrollable grid -->
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
