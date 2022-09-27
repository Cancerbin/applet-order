<template>
	<view>
		<view class="option" v-for="item in options" :key="item.label">
			<view class="label">{{item.label}}</view>
			<view class="content">{{formatValue(item)}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail: {},
				options: [{
						label: '订单号',
						field: 'sheetNo'
					},
					{
						label: '创建时间',
						field: 'createTime'
					},
					{
						label: '商品名称',
						field: 'itemName'
					},
					{
						label: '商品编码',
						field: 'itemNo'
					},
					{
						label: '商品规格',
						field: 'itemSize'
					},
					{
						label: '商品数量',
						field: 'count',
						type: 'quantity'
					},
					{
						label: '商品价格',
						field: 'price',
						type: 'price'
					},
					{
						label: '付款金额',
						field: 'totalAmt',
						type: 'price'
					},
					{
						label: '单位',
						field: 'unitName'
					}
				]
			}
		},
		onLoad(option) {
			this.detail = JSON.parse(decodeURIComponent(option.detail));
		},
		methods: {
			formatValue(record) {
				let text = this.detail[record.field] || '无';
				if (record.type) {
					switch (record.type) {
						case 'price':
							text = this.$utils.formatValue(text);
							break;

						case 'quantity':
							text = parseFloat(text || 0);
							break;

						default:
							break;
					}
				}
				return text;
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.option {
			display: flex;
			flex-direction: row;
			padding: 24rpx 20rpx;
			line-height: 48rpx;
			border-bottom: 1rpx solid #dadbde;
			background-color: #fff;
			
			.label {
				width: 150rpx;
				font-size: 32rpx;
				color: #333;
			}
			
			.content {
				flex: 1;
				font-size: 28rpx;
				color: #999;
				text-align: right;
				word-break: break-all;
				overflow: hidden;
			}
		}
	}
</style>
