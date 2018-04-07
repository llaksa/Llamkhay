dataOu = textread("outP.txt");

for i = 1001:2000
  if (dataOu(i) == "undefined")
    file_id2 = fopen('dataOu.txt', 'a');
    fdisp(file_id2, "96.22" )
    fclose(file_id2)
  else
    file_id2 = fopen('dataOu.txt', 'a');
    fdisp(file_id2, dataOu(i))
    fclose(file_id2)
  endif
endfor

