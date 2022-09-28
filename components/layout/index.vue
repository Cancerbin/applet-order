<template>
	<view class="layout">
		<slot></slot>
		<view class="bottom">
			<slot name="bottom"></slot>
		</view>
	</view>
</template>

<script>
</script>

<style lang="scss">
	.layout {
		height: 100%;
		display: flex;
		flex-direction: column;

		.bottom {
			flex: 1;
			height: 100%;
			overflow: hidden;
		}
	}
</style>
