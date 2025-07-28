
// const currentYear = new Date().getFullYear();
// const currentMonthIndex = new Date().getMonth(); 

// const productList = [
//     { id: 'prodA', name: 'Produk A', targetTahunanFull: 30000000  },
//     { id: 'prodB', name: 'Produk B', targetTahunanFull: 280000 },
//     { id: 'prodC', name: 'Produk C', targetTahunanFull: 150000 },
// ];

// const generateMonthlySales = (year, monthIndex) => {
//     const productsMonthly = productList.map(product => {
//         const avgMonthlyTarget = product.targetTahunanFull / 12;
//         const realisasiFactor = 0.8 + Math.random() * 0.4; 
//         const targetBulanIni = parseFloat(avgMonthlyTarget.toFixed(0));
//         const realisasiBulanIni = parseFloat((avgMonthlyTarget * realisasiFactor).toFixed(0));

//         return {
//             id: product.id,
//             name: product.name,
//             targetBulanIni: targetBulanIni,
//             realisasiBulanIni: realisasiBulanIni,
//         };
//     });

//     const totalTarget = productsMonthly.reduce((sum, p) => sum + p.targetBulanIni, 0);
//     const totalRealisasi = productsMonthly.reduce((sum, p) => sum + p.realisasiBulanIni, 0);

//     return {
//         year: year,
//         monthIndex: monthIndex,
//         monthName: new Date(year, monthIndex, 1).toLocaleString('id-ID', { month: 'long' }),
//         products: productsMonthly,
//         totalTarget: totalTarget,
//         totalRealisasi: totalRealisasi,
//     };
// };

// const salesDataByMonth = [];
// for (let i = 0; i <= currentMonthIndex; i++) {
//     salesDataByMonth.push(generateMonthlySales(currentYear, i));
// }

// const previousMonthDataRaw = currentMonthIndex > 0 ? generateMonthlySales(currentYear, currentMonthIndex - 1) : { totalRealisasi: 0 };


// const yearlyPerformanceData = [
//     { year: currentYear - 3, totalTarget: 5000000, totalRealisasi: 5000000 },
//     { year: currentYear - 2, totalTarget: 5500000, totalRealisasi: 5500000 },
//     { year: currentYear - 1, totalTarget: 6000000, totalRealisasi: 6000000 },

//     { year: currentYear, totalTarget: productList.reduce((sum, p) => sum + p.targetTahunanFull, 0), totalRealisasi: 0 }, // Realisasi akan diisi nanti
// ];


// module.exports = {
//     productList,
//     salesDataByMonth, 
//     previousMonthDataRaw,
//     yearlyPerformanceData,
//     currentMonthIndex,
//     currentYear
// };