module.exports = function formatMoney(amount) {
    return Number(amount).toLocaleString("en-US");
};