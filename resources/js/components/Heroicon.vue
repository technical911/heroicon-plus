<!--
    ============================================
    This is a placeholder for the upgrade that will be needed with Vue 3.x
    ============================================
-->

<template>
    <div class="p-2">
        <div class="text-xs opacity-70 mb-2">Heroicon fieldtype loaded</div>

        <input
            type="text"
            class="input-text w-full"
            :value="current"
            @input="onInput"
            placeholder="Type an icon name…"
        />
    </div>
</template>

<script>
export default {
    mixins: [Fieldtype],

    data() {
        return {
            current: this.value ?? '',
        };
    },

    watch: {
        value(newVal) {
            this.current = newVal ?? '';
        },
    },

    methods: {
        onInput(e) {
            const val = e.target.value;
            this.current = val;
            this.updateValue(val);
        },
    },
};
</script>
