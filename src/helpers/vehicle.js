export const renderVehicleEquipment = (vehicleAnswerGroup, indexes) => {
  return indexes ? indexes.map(index => vehicleAnswerGroup.options[index].description).join(', ') : '';
}

export const renderVehicleAccessories = (vehicleAnswerGroup, indexes) => {
  return indexes ? indexes.map(index => vehicleAnswerGroup.aftermarket[index].description).join(', ') : '';
}