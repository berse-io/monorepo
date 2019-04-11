import React from 'react';
import { Grid, Button, FormControl, InputLabel, Select, MenuItem, Typography, withStyles, Tabs, Tab, TextField } from '@material-ui/core';
import Container from '../../utils/Container';
import { connect } from 'react-redux';
import WalletGate from '../../wallet/WalletGate';
import walletActions from '../../../reducers/wallet/actionTypes'
import Web3Interface from '../../../utils/coinInterfaces/Web3Interface';

// console.log(Web3Interface.getBalance("0x1e17A75616cd74f5846B1b71622Aa8e10ea26Cc0", "Ethereum"));

// import SendIcon from '@material-ui/icons/Send';
// import FavoriteIcon from '@material-ui/icons/Favorite';



const styles:any = (theme:any) => ({
    formControl: {
        width: "100%",
    }
})

class TokenActions  extends React.Component<any> {

    state = {
        action: 0,
        amount: "",
        to: "",
        tokenIndex: 0,
    }

    componentDidMount() {
        this.loadToken();
        
    }

    render() {
        const{classes} = this.props;
        const token = this.props.wallet.tokens[this.state.tokenIndex];

        console.log(token);


        console.log(this.props.wallet);

        

        if(!token) {
            return <></>
        }

        return (
            <WalletGate>
                <Container>
                    <Typography component="h1" variant="h2" gutterBottom>
                        {token.symbol} ({token.name}) - {token.network}
                    </Typography>
                    <form noValidate autoComplete="off">
                        <Grid container spacing={16} justify="flex-start">
                            {/* <Grid item xs={6}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="Token">Token</InputLabel>
                                    <Select
                                        value={"ETH"}
                                        inputProps={{
                                        name: 'Token',
                                        id: 'Token',
                                        }}
                                    >
                                        {
                                            this.state.tokens.map((token:any) => {
                                                return <MenuItem value={"ETH"}>Ether</MenuItem>
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid> */}

                            <Grid item xs={12}>
                                <Tabs
                                    value={this.state.action}
                                    onChange={this.handleSelectAction}
                                    variant="fullWidth"
                                    indicatorColor="secondary"
                                    textColor="secondary"
                                    >
                                    <Tab label="SEND" />
                                    <Tab label="BRIDGE" />
                                    <Tab label="Buy/Sell" />
                                    {/* <Tab icon={<SendIcon />} label="SEND" />
                                    <Tab icon={<FavoriteIcon />} label="BRIDGE" /> */}
                                    {/* <Tab icon={<PersonPinIcon />} label="SWAP" /> */}
                                </Tabs>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    id="amount"
                                    label={`Amount (Balance: ${token.balance})`}
                                    value={this.state.amount}
                                    onChange={this.handleChange('amount')}
                                    margin="normal"
                                    fullWidth
                                    type="number"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    id="to"
                                    label="Receiver"
                                    value={this.state.to}
                                    onChange={this.handleChange('to')}
                                    margin="normal"
                                    fullWidth
                                    type="number"
                                />
                            </Grid>

                            { this.state.action == 1 && <Grid item xs={6}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="network">Network</InputLabel>
                                    <Select
                                        value={"ETH"}
                                        inputProps={{
                                        name: 'Token',
                                        id: 'Token',
                                        }}
                                    >
                                        <MenuItem value={"ETH"}>Ethereum</MenuItem>
                                        <MenuItem value={"GNT"}>TEZOS</MenuItem>
                                        <MenuItem value={"OMG"}>Aeternity</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid> }
                            {/* {this.state.action == 1 && 
                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="network">Destination Network</InputLabel>
                                        <Select
                                            value={"ETH"}
                                            inputProps={{
                                            name: 'Token',
                                            id: 'Token',
                                            }}
                                        >
                                            <MenuItem value={"ETH"}>Ethereum</MenuItem>
                                            <MenuItem value={"GNT"}>TEZOS</MenuItem>
                                            <MenuItem value={"OMG"}>Aeternity</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            } */}

                            <Grid item xs={12}>
                                <Grid style={{height: "100%"}} container alignItems="flex-end" justify="flex-end" direction="row">
                                    <Button variant="contained" color="primary">SEND</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                    
                </Container>
            </WalletGate>
        )
    }

    loadToken = async () => {        
        const{wallet} = this.props;
        let networkAndToken = window.location.pathname.split("/");
        const network = networkAndToken[2].replace(new RegExp('-', 'g'), ' ').toLowerCase();
        const address = networkAndToken[3]
        
        console.log(network);

        let tokenIndex = 0;

        for(tokenIndex = 0; tokenIndex < wallet.tokens.length; tokenIndex++) {
            const item = wallet.tokens[tokenIndex];
            if(item.address.toLowerCase() == address.toLowerCase() && item.network.toLowerCase() == network.toLowerCase()){
                break;
            }
        }
        
        this.setState({
            tokenIndex
        });

        this.props.dispatch({
            type: walletActions.UPDATE_TOKEN_BALANCE,
            tokenIndex: tokenIndex,
        })
    } 

    handleChange = (name:string) => (event:any) => {
        this.setState({ [name]: event.target.value });
    };

    handleSelectAction = (event:any, action:any) => {
        this.setState({ action });
    };
}

const styledTokenActions = withStyles(styles)(TokenActions);

export default connect((state:any) => ({
    wallet: state.wallet,
}))(styledTokenActions);