<template>
	<view>
		<u-swiper :list="detail.detailList" keyName="picUrl" height="300rpx" circular indicator
			indicatorMode="dot" @click=" onClick">
		</u-swiper>
	</view>
</template>

<script>
	export default {
		props: ['detail'],
		data() {
			return {}
		},
		methods: {
			onClick(index) {
				this.$emit('onClick', this.detail, this.detail.detailList[index]);
			}
		}
	}
</script>

<style>
</style>
