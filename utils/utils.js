export default {
	// 格式化促销类型
	formatPromotionType(record) {
		const {
			price,
			promotionType
		} = record;
		const dictionary = {
			'10': '秒杀',
			'20': '特价',
			'30': '团购',
			'40': '满减',
			'50': '满赠',
			'100': '积分兑换'
		}
		return parseFloat(price) === 0 && promotionType === '50' ? '赠品' : dictionary[promotionType];
	},
	// 格式化图片
	formatPicture(value) {
		let url = '/static/empty.png';
		if (value && value !== "null" && value !== "[]") {
			if (value.indexOf("[") >= 0) {
				url = JSON.parse(value)[0];
			} else {
				url = value;
			}
		}
		console.log(url)
		return url;
	},
	// 格式化金额
	formatValue: (value, type) => {
		const cypherType = type || 'amount';
		let number = 0;
		switch (cypherType) {
			case 'amount':
				number = 2;
				break;

			case 'quantity':
				number = 3;
				break;

			default:
				break;
		}
		const factor = Math.pow(10, number); // 进位因子
		const dividend = Math.pow(10, 0 - number); // 退位因子
		const cypherValue = isNaN(value) ? 0 : (value * factor);
		return (cypherValue.toFixed() * dividend).toFixed(number);
	},
	// 退出登录
	logout: () => {
		// 清除缓存
		uni.removeStorageSync('token');
		uni.removeStorageSync('openid');
		uni.removeStorageSync('code');
		uni.removeStorageSync('tenant');
		uni.reLaunch({
			url: '/pages/login/index'
		})
	}
}
