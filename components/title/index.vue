<template>
	<view @click="onClick">
		<picture :url="detail.detailList[0].picUrl" />
	</view>
</template>

<script>
	import picture from '../picture/index.vue';
	export default {
		props: ['detail'],
		data() {
			return {
				height: 0
			}
		},
		methods: {
			onClick(index) {
				this.$emit('onClick', this.detail, this.detail.detailList[0]);
			}
		},
		components: {
			picture
		}
	}
</script>

<style>
</style>
