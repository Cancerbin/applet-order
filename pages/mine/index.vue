<template>
	<view>
		123
		<u-button type="primary" text="分包" @click="onEvnet"></u-button>
	</view>
</template>

<script>
	export default {
		methods: {
			onEvnet() {
				uni.navigateTo({
					url: '/packageMine/pages/mine/order/index'
				})
			}
		}
	}
</script>

<style>
</style>