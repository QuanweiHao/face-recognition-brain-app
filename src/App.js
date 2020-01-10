import React, {Component} from 'react';
import Particles from "react-particles-js";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import './App.css';

const particlesOptions = {
    particles: {
        line_linked: {
            shadow: {
                enable: true,
                color: "#3CA9D1",
                blur: 5
            }
        }
    }
}

const initialState = {
    input: '',
    imageURL: '',
    box: {},
    route: 'signin',
    isSignIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor() {
        super()
        this.state = initialState
    }

    loadUser = (data) => {
        this.setState({user: {
                id: data.id,
                name: data.name,
                email: data.email,
                password: data.password,
                entries: data.entries,
                joined: data.joined
        }})
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
        const image = document.getElementById('inputImage')
        const width = Number(image.width)
        const height = Number(image.height)
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - clarifaiFace.right_col * width,
            bottomRow: height - clarifaiFace.bottom_row * height,
        }
    }

    displayFaceBox = (box) => {
        console.log(box)
        this.setState({box: box})
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value})
    }

    onButtonSubmit = () => {
        this.setState({imageURL: this.state.input})
        fetch('http://localhost:3000/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    fetch('http://localhost:3000/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response => response.json())
                        .then(count => {
                            this.setState(Object.assign(this.state.user, {entries: count}))
                        })
                        .catch(console.log)
                }
                this.displayFaceBox(this.calculateFaceLocation(response))
            })
            .catch(err => console.log(err));
    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({isSignIn: true})
        }
        this.setState({route: route})
    }

    render() {
        const {isSignIn, route, box, imageURL} = this.state
        return (
            <div className="App">
                <Particles className='particles'
                           params={particlesOptions}
                />
                <Navigation isSignIn={isSignIn} onRouteChange={this.onRouteChange}/>
                {
                    route === 'home'
                        ?
                        <div>
                            <Logo />
                            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                            <FaceRecognition box={box} imageURL={imageURL}/>
                        </div>
                        : (
                            route === 'signin'
                            ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                        )

                }
            </div>
        );
    }
}

export default App;
