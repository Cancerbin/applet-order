export default {
	// 格式化金额
	formatAmount: (value) => {
		const factor = Math.pow(10, 2); // 进位因子
		const dividend = Math.pow(10, 0 - 2); // 退位因子
		const cypherValue = isNaN(value) ? 0 : (value * factor);
		return (cypherValue.toFixed() * dividend).toFixed(2);
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
