init:
	npm install
	npm install --prefix app/

dev:
	truffle deploy
	npm run dev --prefix app/

test:
	truffle test
