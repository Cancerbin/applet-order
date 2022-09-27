<template>
	<image mode="aspectFit" :src="url" @load="onLoadPicture" :style="{ height: height +'rpx' }">
	</image>
</template>

<script>
	export default {
		props: ['url'],
		data() {
			return {
				height: 0
			}
		},
		methods: {
			onLoadPicture(e) {
				this.height = parseInt(e.detail.height * 750 / e.detail.width);
			}
		}
	}
</script>

<style>
	image {
		display: block;
		width: 100%;
	}
</style>