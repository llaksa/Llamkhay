inpP = load("entryPos.txt");
outP = load("outputPos.txt");
badP = 0;
pCase = 0;

inpN = load("entryNeg.txt");
outN = load("outputNeg.txt");
badN = 0;
nCase = 0;

for i = 2:length(inpP)
  switch (inpP(i))
    case 0
      if ( (outP(i) != outP(i-1)) && (inpP(i-1) == 0) )
        badP++;
        pCase = i
      endif
    case 255
      if ( (outP(i) == outP(i-1)) && (inpP(i-1) == 255) )
        badP++;
        pCase = i
      endif
  endswitch
endfor

for i = 2:length(inpN)
  switch (inpN(i))
    case 0
      if ( (outN(i) != outN(i-1)) && (inpN(i-1) == 0) )
        badN++;
        nCase = i
      endif
    case 255
      if ( (outN(i) == outN(i-1)) && (inpN(i-1) == 255) )
        badN++;
        nCase = i
      endif
  endswitch
endfor