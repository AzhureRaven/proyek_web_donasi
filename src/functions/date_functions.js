const dateFunctions = {
    todayDate: () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
        const date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return date;
    },
    expirationDate: (days) => {
        const today = new Date();
        today.setDate(today.getDate() + days);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
        const date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return date;
    }
}

module.exports = dateFunctions;