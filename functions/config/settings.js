var getLocalTimeOffset = (country) => {
  switch(country){
    case 'FR' :
      return 1;
  }
  return null;
}

exports.getLocalTimeOffset = getLocalTimeOffset;
