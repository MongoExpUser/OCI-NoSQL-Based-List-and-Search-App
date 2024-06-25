/*****************************************************************************************************************
# *                                                                                                              *
# *  Project: OCI NoSQL-Based List and Search Application                                                        *
# *                                                                                                              *
# *  Copyright © 2024. MongoExpUser.  All Rights Reserved.                                                       *
# *                                                                                                              *
# *  License: MIT - https://github.com/MongoExpUser/OCI-NoSQL-Based-List-and-Search-App/blob/main/LICENSE        *
# *                                                                                                              *
# *  1) The module implements a Crypto class of:                                                                 *
# *     a) Crytographic functionalities                                                                          *
# *  2) The implementation is done with the following Node.js packages                                           *
# *     (a) nodejs native crypto - https://nodejs.org/api/crypto.html                                            *
# *     (b) bcryptjs  - https://www.npmjs.com/package/bcryptjs                                                   *
# *                                                                                                              *
# ****************************************************************************************************************
# * Note:                                                                                                        *
# * a) SHA-512 Algorithm      : SHA-512   --> based on node.js' crypto.createHmac() - depends on OpenSSL version *
# * b) WHIRLPOOL Algorithm    : WHIRLPOOL --> based on node.js' crypto.createHmac() - depends on OpenSSL version *
# * c) BCrypt Algorithm       : Bcrypt    --> based on "bcryptjs" module (https://github.com/dcodeIO/bcrypt.js)  *
# * d) SCrypt Algorithm       : Scrypt    --> based on  node.js' crypto.scrypt()                                 *
# *                                                                                                              *
# * Node.js' crypo algorithm (for crypto.createHmac()) is dependent on the available algorithms supported by     *
# * the version of OpenSSL on the platform.                                                                      *
# * To check available crypo algorithms (for crypto.createHmac()):                                               *
# *                                                                                                              *
# * Option 1 - Within Node.js application file:                                                                  *
# *   const crypto = require('crypto');                                                                          *
# *   console.log(crypto.getHashes());                                                                           *
# *                                                                                                              *
# * Option 2 - On Ubuntu/Linux. From shell, run:                                                                 *
# *   openssl list -digest-algorithms                                                                            *
# *                                                                                                              *
# ***************************************************************************************************************/



import fs from "node:fs";
import util from "node:util";
import crypto from "node:crypto";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";


class Crypto
{
    constructor()
    {
      return null;
    }
    
    static commonModules()
    {
       return {
           uuidv4: uuidv4,
           bcrypt: bcryptjs,
           crypto: crypto
       }
    }
    
    static isCryptoSupported(showAlgorithm)
    {
        try
        {
            const commonModules = Crypto.commonModules();
            const crypto = commonModules.crypto;
        }
        catch(cryptoError)
        {
            console.log("crypto support is disabled or not available!");
            return;
        }
        finally
        {
            // print hash (i.e. digest) algorithms in OpenSSL version bundled  with the current Node.js version
            if(showAlgorithm === true)
            {
              const hashAlgorithms = crypto.getHashes();
              console.log( { "supportedHashAlgorithms" : hashAlgorithms } );
            }
            
            return true;
        }
    }

    
    static verifyConsensus(compareHashSig, combinedHashSigx)
    {
        const comLen = compareHashSig.length;

        for(let i = 0;  i < comLen;  i++) 
        {
            const source = String(compareHashSig[i]);
            const target = String(combinedHashSigx[i]);
            
            if(source !== target) 
            {
                return false;
            }
        }
                           
        return true;
    }
    
    blockchainHash(sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        let showAlgorithm = false;
        
        if(Crypto.isCryptoSupported(showAlgorithm) === true)
        {
            let crypto = new Crypto();
            let rehash = crypto.isHashConsensus(sig, hashAlgorithm);
            return [rehash];
        }
    }
   
    isHashConsensus(init, sig, hashAlgorithm, compareSig, compareSalt, compareHashSig, compareDateNow)
    {
        let showAlgorithm = false;
        let commonModules = Crypto.commonModules();
        let uuidv4        = commonModules.uuidv4;
        let bcrypt        = commonModules.bcrypt;
        let crypto        = commonModules.crypto;
        
        if(Crypto.isCryptoSupported(showAlgorithm) === true)
        {
            let dateNow = new Date();
            let allAlgorithms = ["bcrypt", "sha512", "scrypt"]

            if(allAlgorithms.includes(hashAlgorithm) === false)
            {
                
                hashAlgorithm = "sha512"; //set the default algorithm
            }
            
            if( (init === true) && sig && hashAlgorithm)
            {
                let areSigArray  = Array.isArray(sig);
                let combinedSig = "";

    
                if(areSigArray !== true)
                {
                    console.log('The argument, "sig - i.e. input sig(s)", should be an array. Check, correct and try again!');
                    return;
                }
                else
                {
                    console.log("Creating Hash ...")
                }

                
                if(hashAlgorithm === "bcrypt")
                {
                    let salt = bcrypt.genSaltSync(10);
                    
                    for(let i = 0;  i < sig.length;  i++) 
                    {
                        combinedSig +=  bcrypt.hashSync(sig[i].toString('hex'), salt);
                    }
                    
                    let combinedHashSig = bcrypt.hashSync((combinedSig + dateNow), salt);
                    let result = [salt, combinedHashSig, dateNow];
                    return result;
                }

                if(hashAlgorithm === "sha512")
                {
                    let salt = uuidv4(); 
                        
                    for(let i = 0;  i < sig.length;  i++) 
                    {
                        combinedSig +=  (crypto.createHmac(hashAlgorithm, salt)).update(sig[i]).digest('hex');
                    }
                        
                    let combinedHashSig = (crypto.createHmac(hashAlgorithm, salt)).update(combinedSig + dateNow).digest('hex');
                    let result = [salt, combinedHashSig, dateNow];
                    return result;
                }

                if(hashAlgorithm === "scrypt")
                {
                    let salt = uuidv4();
                    
                    for(let i = 0;  i < sig.length;  i++) 
                    {
                        combinedSig +=  (crypto.scryptSync(sig[i], salt, 64)).toString('hex');
                    }
                        
                    let combinedHashSig  = (crypto.scryptSync(combinedSig + dateNow, salt, 64)).toString('hex');
                    let result = [salt, combinedHashSig, dateNow];
                    return result;
                }
    
            }
            else if( (init === false) && sig && hashAlgorithm && compareSig && compareSalt && compareHashSig && compareDateNow)
            {
                let areHashesArray     = Array.isArray(compareHashSig);
                let areCompareSigArray = Array.isArray(compareSig);
                let areSigArray        = Array.isArray(sig);
                let combinedSigx = "";
                
                let allTrue = (areHashesArray === areCompareSigArray === areSigArray);
                
                if(allTrue !== true)
                {
                    console.log('The arguments: "sig", "compareSig" and "compareHashSig" should all be Arrays. Check, correct and try again!');
                    return;
                }

                if(hashAlgorithm === "bcrypt")
                {
                    for(let i = 0;  i < compareSig.length;  i++) 
                    {
                        combinedSigx +=  bcrypt.hashSync(compareSig[i].toString('hex'), compareSalt);
                    }
                    
                    let combinedHashSigx = bcrypt.hashSync((combinedSigx + compareDateNow), compareSalt);
                    let result = [compareSalt, combinedHashSigx, compareDateNow];
                    console.log( {'final': result } )
                    return Crypto.verifyConsensus([combinedHashSigx], [compareHashSig]);
                }
              
                if(hashAlgorithm === "sha512")
                {
                    for(let i = 0;  i < compareSig.length;  i++) 
                    {
                        combinedSigx +=  (crypto.createHmac(hashAlgorithm, compareSalt)).update(compareSig[i]).digest('hex');
                    }
                    
                    let combinedHashSigx = (crypto.createHmac(hashAlgorithm, compareSalt)).update(combinedSigx + compareDateNow).digest('hex');
                    let result = [compareSalt, combinedHashSigx, compareDateNow];
                    console.log( { equql: combinedHashSigx.toString() === compareHashSig.toString() }  );
                    console.log( {'final': result } )
                    return Crypto.verifyConsensus([combinedHashSigx], [compareHashSig]);
                }
              
                if(hashAlgorithm === "scrypt")
                {
                    for(let i = 0;  i < compareSig.length;  i++) 
                    {
                        combinedSigx +=  (crypto.scryptSync(compareSig[i], compareSalt, 64)).toString('hex');
                    }
                    
                    let combinedHashSigx  =  (crypto.scryptSync(combinedSigx + compareDateNow, compareSalt, 64)).toString('hex');
                    let result = [compareSalt, combinedHashSigx, compareDateNow];
                    console.log( {'final': result } )
                    return Crypto.verifyConsensus([combinedHashSigx], [compareHashSig]);
                }
            
            }
            else
            {
                console.log('Missing or incorrect one or more argument(s). Check, correct and try again!');
                return null;
            }
        }
    }


    testCrypto()
    {
        const crypto           = new Crypto();
        console.log();
        
        console.log('------------Testing Crypto Starts--------------------------');
        
        // show supported algorithms
        const showAlgorithm = true
        
        if(showAlgorithm === true)
        {
            const confirm = Crypto.isCryptoSupported(showAlgorithm);
            console.log( { confirm : confirm } );
        }
        
        const filePath         = "Crypto.mjs"
        const sig1             = "MyNameis?";                              // string to hash
        const sig2             = fs.readFileSync(filePath).toString();     // file to hash
        const sigList          = [sig1, sig2];                             // array of items to hash
        
        //hash algorithm
        const hashAlgorithm1   = 'bcrypt';
        const hashAlgorithm2   = 'sha512';
        const hashAlgorithm3   = 'scrypt';
        
        // prior
        const consensus        = crypto.isHashConsensus(true, sigList, hashAlgorithm1);             
        const priorConsensus   = consensus;                   // store in a database (n = 1)
        const priorHash        = priorConsensus[1];           // store in n-number of databases (1, 2, .. m) 
        
        // verify now
        const compareSigList   = sigList;                     // new signal List - should be technically the same as prior
        const compareSalt      = priorConsensus[0];           // salt to compare: retrieve from q database (n=1)
        const compareHashSig   = [priorConsensus[1]];         // hashes to compare: retrieve from n-number of databases, say 1,2,3 .. into a List/Array
        const compareDateNow   = priorConsensus[2];           // date to compare: retrieve from a database (n=1)
        const validate         = crypto.isHashConsensus(false, sigList, hashAlgorithm1, compareSigList, compareSalt, compareHashSig, compareDateNow);
        
        // show result
        console.log("original :");
        console.log(util.inspect(consensus, { showHidden: false, colors: true, depth: 4 }));
        console.log();
        console.log("validate :");
        console.log(util.inspect(validate, { showHidden: false, colors: true, depth: 4 }));
        console.log()
        console.log('------------Testing Crypto Ends--------------------------');
        console.log();
    }
}


export { Crypto as UserCrypto };
