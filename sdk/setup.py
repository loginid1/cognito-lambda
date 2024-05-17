import setuptools

INSTALL_REQUIRES = [
        "requests",
        "cryptography<40.0.2,>=3.3.2",
        "pyjwt",
        "urllib3<2"
    ]

setuptools.setup(
    name="loginid",
    version="1.0.0",
    author="Quang Hoang",
    author_email="quang@loginid.io",
    description="Interface SDK for LoginID infrastructure",
    long_description_content_type="text/markdown",
    url="https://loginid.io",
    project_urls={
        "Documentation": "https://docs.loginid.io/Server-SDKs/Python/python-get-started"
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    package_dir={"": "src"},
    packages=setuptools.find_packages("src"),
    python_requires=">=3.6",
    install_requires=INSTALL_REQUIRES
)
