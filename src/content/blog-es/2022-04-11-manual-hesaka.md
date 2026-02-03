---
title: "Manual del Parser de Hesaka"
description: "Guía paso a paso para parsear PDFs ofuscados de la Municipalidad de Asunción usando herramientas de código abierto."
pubDate: 2022-04-11
---

Esta es una guía paso a paso para el [parser simple](https://github.com/torresmateo/parser-hesaka) que escribí para parsear [PDFs intencionalmente ofuscados](https://www.asuncion.gov.py/hesaka) por la Municipalidad de Asunción con el único objetivo de minimizar la transparencia de las gestiones.

## Qué software instalar:

El parser es un parser de texto, y no un parser de imágenes. Para obtener el texto, necesitamos instalar dos herramientas gratuitas que nos sirven para un proceso de dos pasos:

1. Transformar el PDF a imágenes (una imagen por página)
2. Detectar el texto en las imágenes, manteniendo los espacios entre las columnas.

El primer paso lo hacemos con el comando [pdftopng](https://www.xpdfreader.com/pdftopng-man.html), para lo cual debemos instalar [XpdfReader](https://www.xpdfreader.com/download.html) (o alguna herramienta que pueda transformar pdf a imágenes [hay](https://linux.die.net/man/1/convert) [muchas](https://poppler.freedesktop.org/) [opciones](https://www.libvips.org/). Instrucciones para instalar XpdfReader (en inglés) en [este link](https://askubuntu.com/questions/1245518/how-to-install-xpdf-on-ubuntu-20-04).

El segundo paso lo hacemos con un software que reconoce caracteres en imágenes. Esto se conoce como OCR, del inglés _Optical Character Recognition_. Yo elegí usar [tesseract](https://github.com/tesseract-ocr/tesseract), ya que es gratis y open source, pero existen [muchas alternativas] para este propósito. Lo único que necesitamos es transformar las imágenes a texto.

## Paso 1 -- Transformar pdf a varias imágenes

Usando `pdftopng` el comando a correr (en una terminal) es el siguiente:

```console
~$ pdftopng -r 600 Febrero_2022.pdf febrero-2022
```

Este comando generará una imagen por cada página a 600 [DPI](https://es.wikipedia.org/wiki/Puntos_por_pulgada), y las va a nombrar `febrero-2022-000001.png`, `febrero-2022-000002.png`, etc. Desde luego, el nombre del PDF va a cambiar dependiendo del PDF que uno quiera analizar, y lo mismo con el último argumento.

> Los archivos de la Municipalidad tienen cientos de páginas, y 600 DPI es una imagen de alta calidad, por lo tanto el comando puede tardar varios minutos, dependiendo de la capacidad de la computadora.

Una vez que el comando termine, estamos listos para reconocer el texto usando tesseract.

## Paso 2 -- Reconocimiento de caracteres

Como estamos lidiando con cientos de imágenes, antes de correr tesseract en si, es conveniente crear primero un archivo para indicarle a tesseract los archivos que debe procesar. Para esto, corremos el siguiente comando en la carpeta donde corrimos `pdftopng`:

```console
~$ ls -d $PWD/febrero-2022-*.png > tesseract_input.txt
```

Con este comando, estamos indicando a la computadora que liste todas las imágenes que creamos usando `pdftopng`, y que guarde esta lista en el archivo `tesseract_input.txt`. Una vez que este archivo exista en la computadora, podemos llamar a tesseract:

```console
~$ tesseract -l spa tesseract_input.txt febrero-2022 --psm 6 -c preserve_interword_spaces=1
```

En este comando le decimos a `tesseract` que:
* Procese la lista que escribimos en `tesseract_input.txt`
* Guarde los resultados en `febrero-2022.txt` (la extensión `.txt` se agrega sola)
* `--psm 6` indica que queremos que la imagen se interprete como un bloque de texto único (es decir, va a leer cada línea hasta el final, en lugar de intentar detectar columnas)
* `-c preserve_interword_spaces=1` indica que queremos mantener la separación entre palabras, incluso si eso significa agregar una cantidad anormal de espacios.

> Posiblemente esta sea la parte más lenta del proceso, ya que procesar la imágenes se hace con un modelo de machine learning que require relativamente mucho poder computacional.

## Paso 3 -- Usar el parser para extraer los datos a excel

El parser está escrito en python, y requiere de que se instalen algunas bibliotecas específicas para funcionar. Para instalar las bibliotecas requeridas, en la terminal se debe escribir:

```console
~$ pip install -r requirements.txt
```

> IMPORTANTE: dependiendo de tu experiencia con python puede ser una buena idea crear un entorno virtual primero

Una vez que las dependencias están instaladas, para exportar un excel

## La estructura de las imágenes de Hesaka.

La estructura de todas las páginas de los archivos de Hesaka se ven como la siguiente imágen:
![screenshot-pdf](/images/blog/manual-hesaka/screenshot-pdf.png)

Es decir, tenemos las columnas:

* Cédula (un número)
* Nombre
* Relación Laboral
* Monto
* Concepto
* Dependencia
* Cargo (opcional)
* Año de Ingreso (completa en esta figura, pero a veces no está especificado, entonces también opcional)
