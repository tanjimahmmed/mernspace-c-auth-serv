function welcome(name: string) {
    console.log('hello');

    const user = {
        name: 'Tanjim',
    };

    const fname = user.name;

    return name + fname;
}

welcome('Tanjim');
