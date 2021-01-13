import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    body {
        background-color: #212121;
        color: #fff;
    }

    .card {
        color: #f5f5f5
        position: unset;
        background-color: #232323;
        border: 0px solid rgba(0,0,0,.125);
    }

    .form-control {
        background-color: #212121;
        border: 1px solid #212121;
        color: #495057;
        &:not(:placeholder-shown) {
            background-color:  #212121!important;
        }
        &:placeholder-shown {
            background-color:  #212121!important;
        }
        &:focus {
            color: #fff;
        }
    }

    .btn {
        &:not(:disabled):not(.disabled) {
            border: none;
            box-shadow: none !important;
        } 
    }

    .btn-primary {
        color: #fff;
        background: linear-gradient(90deg, rgba(237,110,159,1) 50%, rgba(236,139,107,1) 100%);
        border-color: rgba(237,110,159,0);
        &:disabled {
            border-color: rgba(237,110,159,0);
        }
    }

    .btn-secondary {
        color: #fff;
        background: linear-gradient(90deg, rgba(0,188,212,1) 0%, rgba(76,175,80,1) 100%);
        border-color: rgba(237,110,159,0);
        &:disabled {
            border-color: rgba(237,110,159,0);
        }
    }

    .nav-tabs {
        border-bottom: none;
        a {
            color: #fff;
        }
    }

    .progress {
        background-color: #212121;
        height: 0.2rem;
    }

    .progress-bar {
        background: linear-gradient(90deg, rgba(236,64,122,1) 0%, rgba(38,198,218,1) 100%);
    }


`
