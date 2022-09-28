<template>
	<view class="module">
		<view class="main" @click="onClick(0)">
			<u--image :src="detail.detailList[0].picUrl" width="345rpx" height="400rpx" mode="scaleToFill" radius="12rpx">
			</u--image>
		</view>
		<view class="vice">
			<view @click="onClick(1)">
				<u--image :src="detail.detailList[1].picUrl" width="345rpx" height="190rpx" mode="scaleToFill" radius="12rpx">
				</u--image>
			</view>
			<view class="sub" @click="onClick(2)">
				<u--image :src="detail.detailList[2].picUrl" width="345rpx" height="190rpx" mode="scaleToFill" radius="12rpx">
				</u--image>
			</view>
		</view>
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

<style lang="scss">
	.module {
		display: flex;
		flex-direction: row;
		padding: 0 20rpx;

		.main {
			width: 345rpx;
		}

		.vice {
			width: 345rpx;
			margin-left: 20rpx;

			.sub {
				margin-top: 20rpx;
			}
		}
	}
</style>
