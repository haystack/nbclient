const isLog = false

export function isDone([UE,ME], [UQ,MQ], [UF,MF], N) {
    isLog && console.log(`Are we done?`);
    if ( (ME.length === 0 && UE.length <= UQ.length && UE.length <= UF.length) 
      || (MF.length === 0 && UF.length <= UE.length && UF.length <= UE.length) 
      || (MQ.length === 0 && UQ.length <= UE.length && UQ.length <= UF.length) 
      || N.length === 0 ) {
        isLog && console.log(`Yes`);
        return true
    }

    isLog && console.log(`No`);
    return false
}

export function getTheLeast([UE,ME], [UQ,MQ], [UF,MF]) {
    if (ME.length > 0 && (UE.length < UF.length || (UE.length === UF.length && ME.length <= MF.length)) && (UE.length < UQ.length || (UE.length === UQ.length && ME.length <= MQ.length))) {
        isLog && console.log(`Least is E`);
        return [UE,ME]
    } else if (MF.length > 0 && (UF.length < UE.length || (UF.length === UE.length && MF.length <= ME.length)) && (UF.length < UQ.length || (UF.length === UQ.length && MF.length <= MQ.length))) {
        isLog && console.log(`Least is F`);
        return [UF,MF]
    } else if (MQ.length > 0 && (UQ.length < UF.length || (UQ.length === UF.length && MQ.length <= MF.length)) && (UQ.length < UE.length || (UQ.length === UE.length && MQ.length <= ME.length))) {
        isLog && console.log(`Least is Q`);
        return [UQ,MQ]
    } else {
        isLog && console.log(`We are done!`);
        return [[],[]]
    }
}

function removeItem(M, item) {
    const index = M.findIndex(i => i.id === item.id)

    if (index) {
        M.splice(index, 1)
    }
}

export function howManyToPick(UE, UQ, UF, N) {
    let pick = UE.length

    if (UF.length < pick) {
        pick = UF.length
    }

    if (UQ.length < pick) {
        pick = UQ.length
    }

    if (N.length < pick) {
        pick = N.length
    }

    return pick > 3 ? 3 : pick
}

function pickAndApplySpotlight(U, spotlight) {
    const i = Math.floor(Math.random()*U.length)
    const c = U[i]
    U.splice(i, 1)
    c.systemSpotlight = spotlight
}

export function runExp([UE,ME], [UQ,MQ], [UF,MF], N, configs) {
    console.log('runExp');
    console.log(configs);
    console.log(`UE: ${UE.length}\tME: ${ME.length}\tUQ: ${UQ.length}\tMQ: ${MQ.length}\tUF: ${UF.length}\tMF: ${MF.length}\tN: ${N.length}\ttotal: ${UE.length+ME.length+UQ.length+MQ.length+UF.length+MF.length+N.length}`);

    while(!isDone([UE,ME], [UQ,MQ], [UF,MF], N)) {
        const [U, M] = getTheLeast([UE,ME], [UQ,MQ], [UF,MF])

        if (M.length === 0) {
            console.log(`Done (in while loop.)`);
            break
        }

        // pick one from M and add to U
        const item = M.pop()
        U.push(item)
        removeItem(ME, item)
        removeItem(MF, item)
        removeItem(MQ, item)

        isLog && console.log(`==================================================`);
        isLog && console.log(`UE: ${UE.length}\tME: ${ME.length}\tUQ: ${UQ.length}\tMQ: ${MQ.length}\tUF: ${UF.length}\tMF: ${MF.length}\tN: ${N.length}\ttotal: ${UE.length+ME.length+UQ.length+MQ.length+UF.length+MF.length+N.length}`);        
    }

    console.log(`==================================================`);
    console.log(`UE: ${UE.length}\tME: ${ME.length}\tUQ: ${UQ.length}\tMQ: ${MQ.length}\tUF: ${UF.length}\tMF: ${MF.length}\tN: ${N.length}\ttotal: ${UE.length+ME.length+UQ.length+MQ.length+UF.length+MF.length+N.length}`);
    console.log(`pick: ${howManyToPick(UE, UQ, UF, N)}`);

    const pick = howManyToPick(UE, UQ, UF, N)
    if (pick > 0) {
        for (let index = 0; index < pick; index++) {
            pickAndApplySpotlight(UE, configs.spotlightEndorsThreadConfig)
            pickAndApplySpotlight(UF, configs.spotlightFollowThreadConfig)
            pickAndApplySpotlight(UQ, configs.spotlightQuestionThreadConfig)
            pickAndApplySpotlight(N,  configs.spotlightGeneralThreadConfig)
        }

        configs.expCurrentShowingSpotlights = pick*4
    }


}