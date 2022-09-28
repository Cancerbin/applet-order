<template>
	<view class="module">
		<view class="column" v-for="item in detail.detailList" :key="item.id" @click="onClick(item)">
			<image :src="item.picUrl"></image>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['detail'],
		data() {
			return {}
		},
		created() {
		},
		methods: {
			onClick(record) {
				this.$emit('onClick', this.detail, record);
			}
		}
	}
</script>

<style lang="scss">
	.module {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 10rpx 0;
		background-color: #fff;

		.column {
			display: flex;
			width: 25%;
			padding: 10rpx 0;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			
			image {
				width: 140rpx;
				height: 140rpx;
			}
		}
	}
</style>
